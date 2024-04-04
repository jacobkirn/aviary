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
import NuthatchApiComponent from './NuthatchApiComponent';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '', // State to store the user's first name
    };
  }

  componentDidMount() {
    // Get the current user from Firebase Auth
    const currentUser = auth.currentUser;

    // Check if the user is signed in
    if (currentUser) {
      // Extract the user's display name (first name)
      const firstName = currentUser.displayName.split(' ')[0];
      // Set the state with the user's first name
      this.setState({ firstName });
    }
  }

  render() {
    const { firstName } = this.state;
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
                <NuthatchApiComponent />
              </TabPanel>
              <TabPanel>
                <p>two!</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>

      </div>
    );
  }
}
