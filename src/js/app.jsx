import React from 'react';



export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      balance: '',
      rate: '',
      term: '',
      payment: '',
      amortizationSchedule: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.calculatePayment = this.calculatePayment.bind(this);
    this.exportToExcel = this.exportToExcel.bind(this);
  }

  handleChange(event) {
    console.log('handleChange called');
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  }

  calculatePayment() {
    console.log('calculatePayment called');
    const { balance, rate, term } = this.state;
    const principal = parseFloat(balance);
    const monthlyRate = parseFloat(rate) / 100 / 12;
    const numberOfPayments = parseInt(term) * 12;

    if (monthlyRate === 0) {
      const monthlyPayment = principal / numberOfPayments;
      this.setState({
        payment: `$${monthlyPayment.toFixed(2)} is your payment`,
        amortizationSchedule: this.calculateAmortization(principal, monthlyRate, numberOfPayments, monthlyPayment)
      });
      return;
    }

    const numerator = monthlyRate * Math.pow((1 + monthlyRate), numberOfPayments);
    const denominator = Math.pow((1 + monthlyRate), numberOfPayments) - 1;
    const monthlyPayment = principal * (numerator / denominator);

    this.setState({
      payment: `$${monthlyPayment.toFixed(2)} is your payment`,
      amortizationSchedule: this.calculateAmortization(principal, monthlyRate, numberOfPayments, monthlyPayment)
    });
  }

  calculateAmortization(principal, monthlyRate, numberOfPayments, monthlyPayment) {
    console.log('calculateAmortization called');
    const amortizationSchedule = [];
    let balance = principal;

    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      amortizationSchedule.push({
        month,
        principalPayment: principalPayment.toFixed(2),
        interestPayment: interestPayment.toFixed(2),
        balance: balance.toFixed(2)
      });
    }

    return amortizationSchedule;
  }

  exportToExcel() {
    console.log('exportToExcel called');
    const ws = XLSX.utils.json_to_sheet(this.state.amortizationSchedule);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AmortizationSchedule");
    XLSX.writeFile(wb, "AmortizationSchedule.xlsx");
  }

  render() {
    console.log('render called');
    return (
      <div className="container">
        <h3>Mortgage Calculator</h3>
        <div className="form-group">
          <label>Loan Balance</label>
          <input
            type="number"
            className="form-control"
            name="balance"
            value={this.state.balance}
            onChange={this.handleChange}
          />
        </div>
        <div className="form-group">
          <label>Interest Rate (%)</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            name="rate"
            value={this.state.rate}
            onChange={this.handleChange}
          />
        </div>
        <div className="form-group">
          <label>Loan Term (years)</label>
          <select
            className="form-control"
            name="term"
            value={this.state.term}
            onChange={this.handleChange}
          >
            <option value="15">15</option>
            <option value="30">30</option>
          </select>
        </div>
        <button name="submit" className="btn btn-primary" onClick={this.calculatePayment}>
          Calculate
        </button>
        <div id="output" className="mt-3 alert alert-info">
          {this.state.payment}
        </div>
        {this.state.amortizationSchedule.length > 0 && (
          <div>
            <div className="table-responsive">
              <table className="table mt-3">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Principal Payment</th>
                    <th>Interest Payment</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.amortizationSchedule.map((payment) => (
                    <tr key={payment.month}>
                      <td>{payment.month}</td>
                      <td>${payment.principalPayment}</td>
                      <td>${payment.interestPayment}</td>
                      <td>${payment.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="btn btn-secondary mt-3" onClick={this.exportToExcel}>
              Export to Excel
            </button>
          </div>
        )}
      </div>
    );
  }
}
