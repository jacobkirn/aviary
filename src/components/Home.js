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
      user: null
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

  render() {
    const { firstName, user } = this.state;
    return (
      <div>
        <Container maxW="container.xl" >
          <h2 id="welcome">Welcome, {firstName}.</h2>
          <Tabs position="relative" variant="unstyled">
            <TabList>
              <Tab>Search</Tab>
              <Tab>Lists</Tab>
            </TabList>
            <TabIndicator
              mt="4px"
              height="2px"
              bg="blue.500"
              borderRadius="1px"
            />
            <TabPanels>
              <TabPanel>
                <Search />
              </TabPanel>
              <TabPanel>
                {/* Pass the user prop to the Lists component */}
                <Lists user={user} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </div>
    );
  }
}