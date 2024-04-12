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
      user: null,
      refreshLists: false,
      tabIndex: 0,
    };
    this.searchInputRef = createRef();
  }

  componentDidMount() {
    const currentUser = auth.currentUser;
    if (currentUser) {
      this.setState({ user: currentUser });
    }

    const savedTabIndex = localStorage.getItem('tabIndex');
    if (savedTabIndex) {
      this.setState({ tabIndex: Number(savedTabIndex) });
    }
  }

  changeTabAndFocusSearch = () => {
    this.setState({ tabIndex: 2 }, () => {
      // Assuming the Search component properly exposes a focusInput method via forwarded ref
      this.searchInputRef.current && this.searchInputRef.current.focusInput();
    });
  }

  onTabChange = (index) => {
    this.setState({ tabIndex: index }, () => {
      localStorage.setItem('tabIndex', index.toString());
    });
  }

  triggerListRefresh = () => {
    this.setState(prevState => ({ refreshLists: !prevState.refreshLists }));
  }

  handleAddBird = () => {
    console.log('Bird added!');
    this.triggerListRefresh();
  }

  render() {
    const { user, refreshLists } = this.state;
    return (
      <Container maxW="container.xl">
        <Tabs mt="20px" index={this.state.tabIndex} onChange={this.onTabChange} size="lg" position="relative" variant="unstyled">
          <TabList>
            <Tab>Home</Tab>
            <Tab>Lists</Tab>
            <Tab>Search</Tab>
          </TabList>
          <TabIndicator mt="0px" height="4px" bg="blue.500" borderRadius="3px" />
          <TabPanels>
            <TabPanel>
              <Home user={user} />
            </TabPanel>
            <TabPanel>
              <Lists user={user} refreshLists={refreshLists} onAddBirdsClick={this.changeTabAndFocusSearch} />
            </TabPanel>
            <TabPanel>
              <Search user={user} ref={this.searchInputRef} onAddBird={this.handleAddBird} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    );
  }
}
