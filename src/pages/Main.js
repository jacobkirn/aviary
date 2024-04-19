import React, { Component, createRef } from 'react';
import { auth } from '../firebase';
import {
	Container,
	Tabs,
	Tab,
	TabList,
	TabIndicator,
	TabPanels,
	TabPanel,
} from '@chakra-ui/react';
import { RiHome7Line } from "react-icons/ri";
import { RiFileList2Line } from "react-icons/ri";
import { IoSearchSharp } from "react-icons/io5";
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

		this.changeTab = this.changeTab.bind(this);
	}

	componentDidMount() {
		const currentUser = auth.currentUser;
		if (currentUser) {
			this.setState({ user: currentUser });
		}
	
		const savedTabIndex = localStorage.getItem('tabIndex');
		if (savedTabIndex) {
			this.setState({ tabIndex: Number(savedTabIndex) });
		} else {
			this.setState({ tabIndex: 0 });
		}
	}

	changeTab = (index) => {
		this.setState({ tabIndex: index }, () => {
			localStorage.setItem('tabIndex', index.toString());
		});
	}

	changeTabAndFocusSearch = () => {
		this.setState({ tabIndex: 1 }); 
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

	getTabStyles = (isSelected) => ({
		color: isSelected ? 'blue.500' : 'gray.600',
		fontWeight: isSelected ? 'bold' : 'normal',
		marginRight: '10px'
	});

	render() {
		const { user, refreshLists, tabIndex } = this.state;
		return (
			<Container maxW="container.xl">
				<Tabs mt="20px" index={tabIndex} onChange={this.onTabChange} size="lg" variant="unstyled">
					<TabList>
						{/* I will revisit the home page in the next release 
						<Tab _selected={{ color: 'blue.500'}} _focus={{ boxShadow: 'none' }} px="20px">
							<RiHome7Line style={this.getTabStyles(tabIndex === 0)} />Home
						</Tab> */}
						<Tab _selected={{ color: 'blue.500' }} _focus={{ boxShadow: 'none' }} px="20px">
							<RiFileList2Line style={this.getTabStyles(tabIndex === 1)} />Lists
						</Tab>
						<Tab _selected={{ color: 'blue.500' }} _focus={{ boxShadow: 'none' }} px="20px">
							<IoSearchSharp style={this.getTabStyles(tabIndex === 2)} />Search
						</Tab>
					</TabList>
					<TabIndicator mt="0px" height="2px" bg="blue.500" borderRadius="3px" />
					<TabPanels>
						{/* I will revisit the home page in the next release 
						<TabPanel>
							<Home user={user} onNavigateToLists={() => this.changeTab(1)} />
						</TabPanel> */}
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