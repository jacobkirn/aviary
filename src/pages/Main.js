import React, { Component, createRef } from 'react';
import { auth } from '../firebase';
import {
  Container,
  Tabs,
  Tab,
  TabList,
  TabIndicator,
  TabPanels,
  TabPanel
} from '@chakra-ui/react';
import Home from './Home';
import Search from './Search';
import Lists from './Lists';

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      user: null,
      refreshLists: false,
      tabIndex: 0, // Add this line to track the active tab
    };
    this.searchInputRef = createRef(); // Create a ref for the Search input
  }

  changeTabAndFocusSearch = () => {
    this.setState({ tabIndex: 1 }, () => {
      this.searchInputRef.current && this.searchInputRef.current.focusInput();
    });
  }

  componentDidMount() {
    // Get the current user from Firebase Auth
    const currentUser = auth.currentUser;

    // Check if the user is signed in
    if (currentUser) {
      // Extract the user's display name (first name)
      const firstName = currentUser.displayName.split(' ')[0];
      // Set the state with the user's first name and user object
      this.setState({ firstName, user: currentUser });
    }
  }

  // Add a method to toggle refresh
  triggerListRefresh = () => {
    this.setState(prevState => ({ refreshLists: !prevState.refreshLists }));
  }

  changeTabAndFocusSearch = () => {
    this.setState({ tabIndex: 1 }, () => {
      // Assuming the Search component properly exposes a focusInput method via forwarded ref
      this.searchInputRef.current && this.searchInputRef.current.focusInput();
    });
  }

  handleAddBird = () => {
    // Logic to handle after a bird is added
    console.log('Bird added!');
    this.triggerListRefresh(); // Assuming you want to refresh lists after adding a bird
  }

  render() {
    const { firstName, user, refreshLists } = this.state;
    return (
      <div>
        <Container maxW="container.xl" >
          {/*
          <h2 id="welcome">Welcome, {firstName}.</h2> */}
          <Tabs mt="20px" index={this.state.tabIndex} onChange={(index) => this.setState({ tabIndex: index })} size="lg" position="relative" variant="unstyled">
            <TabList>
              <Tab>Home</Tab>
              <Tab>Lists</Tab>
              <Tab>Search</Tab>
            </TabList>
            <TabIndicator
              mt="0px"
              height="3px"
              bg="blue.500"
              borderRadius="8px"
            />
            <TabPanels>
            <TabPanel>
                <Home />
              </TabPanel>
              <TabPanel>
                <Lists user={user} refreshLists={refreshLists} onAddBirdsClick={this.changeTabAndFocusSearch} />
              </TabPanel>
              <TabPanel>
                <TabPanel>
                  <Search user={user} ref={this.searchInputRef} onAddBird={this.handleAddBird} />
                </TabPanel>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </div>
    );
  }
}