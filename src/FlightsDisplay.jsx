import React, {Component} from 'react';

const appId = "8016ca2d"
const appKey = "15309b09ce4b3ad4875d214fd8a60d8b"
const requestedAirport = "SVO"

class FlightsDisplay extends Component {
  constructor() {
    super();
    this.state = {
      flightData: null,
      title: "Departure",
      requestedYear: 2018,
      requestedMonth: 1,
      requestedDate: 1,
      requestedHours: 0,
      searchText: ""
    };
    this.handleTextChange = this
      .handleTextChange
      .bind(this);
  }

  componentDidMount() {
    const param = this.props.param;
    const name = this.props.name;

    var title;
    if (name === "Вылет") {
      title = "Табло вылета";
    } else if (name === "Прилет") {
      title = "Табло прилета";
    } else if (name === "Задержанные (вылет)") {
      title = "Табло вылета - Задержанные"
    } else {
      title = "Табло прилета - Задержанные"
    }
    this.setState({title: title})

    var date = new Date();
    const requestedYear = date.getFullYear();
    const requestedMonth = date.getMonth() + 1;
    const requestedDate = date.getDate();
    const requestedHours = date.getHours();

    this.setState({requestedYear: requestedYear, requestedMonth: requestedMonth, requestedDate: requestedDate, requestedHours: requestedHours})

    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

    const URL = "https://api.flightstats.com/flex/flightstatus/rest/v2/json/airport/status/" + requestedAirport + "/" + param + "/" + requestedYear + "/" + requestedMonth + "/" + requestedDate + "/" + requestedHours + "?appId=" + appId + "&appKey=" + appKey + "&numHours=2";

    fetch(proxyUrl + URL)
      .then(res => res.json())
      .then(json => {
        this.setState({flightData: json});
      });
  }

  print() {
    var name = this.props.name;
    const flightData = this.state.flightData;
    if (name === "Вылет") {
      this.sortByTimeForDep(flightData);
      return this.printDep(flightData.flightStatuses);
    } else {
      if (name === "Прилет") {
        this.sortByTimeForArr(flightData);
        return this.printArr(flightData.flightStatuses);
      } else if (name === "Задержанные (вылет)") {
        this.sortByTimeForDep(flightData);
        return this.delay(flightData.flightStatuses);
      } else {
        this.sortByTimeForArr(flightData);
        return this.delay(flightData.flightStatuses);
      }
    }
  }

  delay(obj) {
    var delayList = [];
    Object
      .keys(obj)
      .map((item, index) => {
        if (obj[index].hasOwnProperty("delays")) {
          if (obj[index].delays.hasOwnProperty("departureGateDelayMinutes")) {
            delayList.push(obj[index])
          }
        }
      });
    if (this.props.name === "Задержанные (вылет)") {
      return this.printDep(delayList);
    } else 
      return this.printArr(delayList);
    }
  
  sortByTimeForDep(flightData) {
    var array = flightData.flightStatuses;
    array.sort(function (obj1, obj2) {
      return new Date(obj1.departureDate.dateLocal) - new Date(obj2.departureDate.dateLocal);
    });
  }

  sortByTimeForArr(flightData) {
    var array = flightData.flightStatuses;
    array.sort(function (obj1, obj2) {
      return new Date(obj1.arrivalDate.dateLocal) - new Date(obj2.arrivalDate.dateLocal);
    });
  }

  printDep(obj) {
    return Object
      .keys(obj)
      .map((item, index) => <tr key={index}>
        <td>{obj[index]
            .departureDate
            .dateLocal
            .substr(11, 5)}</td>
        <td>{obj[index].arrivalAirportFsCode}</td>
        <td>{obj[index].carrierFsCode} {obj[index].flightNumber}</td>
        <td>{this.status(obj[index])}</td>
      </tr>);
  }

  caseStatus(obj) {
    switch (obj.status) {
      case "L":
        return "Совершил посадку";
      case "A":
        return "В полете";
      case "C":
        return "Отменен";
      case "S":
        return "По расписанию";
      default:
        return " ";
    }
  }

  status(obj) {
    if (obj.hasOwnProperty("delays")) {
      if (obj.delays.hasOwnProperty("departureGateDelayMinutes")) {
        return ("Задержан на " + obj.delays.departureGateDelayMinutes + " минут");
      } else {
        return this.caseStatus(obj);
      }
    } else {
      return this.caseStatus(obj);
    }
  }

  printArr(obj) {
    return Object
      .keys(obj)
      .map((item, index) => <tr key={index}>
        <td>{obj[index]
            .arrivalDate
            .dateLocal
            .substr(11, 5)}</td>
        <td>{obj[index].departureAirportFsCode}</td>
        <td>{obj[index].carrierFsCode} {obj[index].flightNumber}</td>
        <td>{this.status(obj[index])}</td>
      </tr>);
  }

  handleTextChange(event) {
    this.setState({searchText: event.target.value});
  }

  changeDateFormat(a) {
    var str = a;
    return str[11] + str[12] + str[13] + str[14] + str[15];
  }

  printSearchResult() {
    const flightData = this.state.flightData;
    var searchigList = [];
    var search = this.state.searchText;

    Object
      .keys(flightData.flightStatuses)
      .map((item, index) => {
        if ((flightData.flightStatuses[index].carrierFsCode === search) || (flightData.flightStatuses[index].flightNumber === search.substring(2)) || (flightData.flightStatuses[index].flightNumber === search)) 
          searchigList.push(flightData.flightStatuses[index])
      });
    if (this.props.param === "dep") {
      return this.printDep(searchigList);
    } else {
      return this.printArr(searchigList);
    }
  }

  createTable() {
    if (this.state.searchText === "") {
      return this.print();
    } else {
      return this.printSearchResult();
    }
  }

  render() {
    const flightData = this.state.flightData;
    if (!flightData) 
      return <div>Loading</div>;
    return (
      <div>
        <h1>{this.state.title} {this.state.requestedDate}.{this.state.requestedMonth}.{this.state.requestedYear}
        </h1>
        <p>Время {this.state.requestedHours}:00 - {this.state.requestedHours + 2}:00</p>
        <form className="form-inline my-2 my-lg-0">
          <input
            className="form-control mr-sm-2"
            type="text"
            placeholder="Поиск по рейсу"
            onChange={this.handleTextChange}></input>
        </form>
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="row">
                Время
              </th>
              <th>
                Аэропорт
              </th>
              <th>
                Рейс
              </th>
              <th>
                Статус
              </th>
            </tr>
          </thead>
          <tbody>
            {this.createTable()}
          </tbody>
        </table>
      </div>
    );
  }
}

export default FlightsDisplay;