import React, { Component } from 'react';
import './App.css';
import FlightsDisplay from './FlightsDisplay.jsx'
import 'bootswatch/dist/journal/bootstrap.css';
import { Navbar, NavItem, Nav, Grid, Row, Col } from "react-bootstrap";


const MENU = [
  { name: "Вылет", param: "dep"},
  { name: "Прилет", param: "arr"},
  { name: "Задержанные (вылет)", param: "dep"},
  { name: "Задержанные (прилет)", param: "arr"}
];

class App extends Component {

  constructor() {
    super();
    this.state = {
      activeItem: 0,
    };
  }

  render() {
    const activeItem = this.state.activeItem;
    return (
      <div>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              Шереметьево Международный Аэропорт
            </Navbar.Brand>
          </Navbar.Header>
        </Navbar>
        <Grid>
          <Row>
            <Col md={3}>
              <h2>Табло рейсов</h2>
              <div>
              <Nav
                bsStyle="pills"
                stacked
                activeKey={activeItem}
                onSelect={index => {
                  this.setState({ activeItem: index });
                }}
              >
                {MENU.map((menu, index) => (
               <NavItem key={index} eventKey={index}><h3 className="nav-link">{menu.name}</h3></NavItem>
                ))}
              </Nav>
              </div>
            </Col>
            <Col md={9}>
            <FlightsDisplay key={activeItem} param={MENU[activeItem].param} name={MENU[activeItem].name} />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default App;
