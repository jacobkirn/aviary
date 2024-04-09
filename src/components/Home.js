import React, { Component } from 'react';
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
import Search from './Search';
import Lists from './Lists';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      user: null,
      refreshLists: false // Add this line
    };
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

  render() {
    const { firstName, user, refreshLists } = this.state;
    return (
      <div>
        <Container maxW="container.xl" >
          <h2 id="welcome">Welcome, {firstName}.</h2>
          <Tabs size="lg" position="relative" variant="unstyled">
            <TabList>
              <Tab>Lists</Tab>
              <Tab>Search</Tab>
            </TabList>
            <TabIndicator
              mt="4px"
              height="2px"
              bg="blue.500"
              borderRadius="1px"
            />
            <TabPanels>
              <TabPanel>
                <Lists user={user} refreshLists={refreshLists} />
              </TabPanel>
              <TabPanel>
                <Search user={user} onAddBird={this.triggerListRefresh} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </div>
    );
  }
}