import React, { Component } from 'react';
import { PolySynth } from 'tone';
//import ReactDOM from 'react-dom';
import 'bootswatch/dist/solar/bootstrap.min.css'; 
import './App.css';

class App extends Component {

  render() {
    return(
      <div>
        <body class>
          <div class="container">
            <div className="page-header" id="banner">
              <div class="row">
                <div class="col-lg-8">
                  <h1>Note Frequency Math</h1>
                  <p class="lead">Go Nimbly Interview Project by Amy Herz</p>
                </div>
              </div>
            </div>
            <div class="bs-docs-section clearfix">
              <div className="jumbotron">
                  <p>The octave in music is comprised of 12 notes, each note 
                   corresponding to a frequency or pitch measured in Hertz. How do we measure 
                   the pleasantness or consonance of two notes together? </p>
                   <p>It is not a matter of opinion but rather math! The frequency of 
                   the highest note in an octave is exactly twice that of the lowest note in the octave.
                    This creates a <em>geometric sequence</em> when you keep going by octaves. If you 
                    took a string and plucked it, and then halved it and plucked it again, you would have a 
                    doubled frequency.</p>
                  <p>As you then break down the other 12 semitones between the octave, you get different 
                    ratios between each note but what creates <strong>harmonics</strong> is an additive
                    step rather than a multiplicative, making it an <em>arithmetic sequence</em>. 
                    To explain, if you plucked a string again and watched it vibrate in slow motion, 
                    you would see that it vibrates in many modes with the main one being the first harmonic, 
                    giving the note its specified frequency. The string can also vibrate in higher modes, 
                    or harmonics, at various times or simultaneously, with the sequence of these harmonics 
                    forming the arithmetic sequence.
                  </p>
                  <h3>Plug in a number of semitones to go from our base note A4 at 440Hz, and then 
                    view the results to determine whether the two notes are more consonant or disonant.
                  </h3>
                  <hr class="my-4" />
                  <SemitonesForm />
              </div>
            </div>
          </div>
        </body>
      </div>
    );
  }
}

/*  
  Starting with a base of A4 with a nice integer note frequency of 440.
  This frequency will remain unchanged as our point of reference.
  Might eventually put this back as it's own component but right now it's in the form

function BaseInput(props) {
  const base = {freq:"440", note:"A4"};
  return (
    <div className="form-group">
      <fieldset>
        <label className="control-label" for="baseFrequency">Base Frequency (in Hertz)</label>
        <input className="form-control form-control-lg" type="number" placeholder="440" id="baseFrequency" readOnly={true} value="440"></input>
        <small id="baseFreqHelp" className="form-text text-muted">We are starting with the "Middle A" (A4) with a frequency of 440Hz</small>
      </fieldset>
    </div>
  );
}
*/

/*
  Simple function to set state of other class and pass to results

function updateResults(freq) {
  this.setState({freq})
}
*/

/*  
  From our base note, user provides number of semitones, or half steps to travel from there.
  User can input positive number to travel up or negative number to travel down in pitch.
*/
class SemitonesForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      number: 0,
      note: "A4",              // user inputted number of semitones
      frequency: 440,         // frequency of resulting note
      logResult: 0,           // result of log newton API call
      pianoKey: 49,           // key number on piano
      isLoading: false,       // true/false if component is loading
      error: null,            // in case there is an error to display
      displayResults: false   // render when results are ready
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this);
    //this.calculateFrequency = this.calculateFrequency.bind(this);

    //this.tone = new Tone.Frequency("A4")
    this.synth = new PolySynth(2).toMaster()
    //var synth = new Tone.Synth().toMaster()
  }

  handleChange(event) {
    this.setState({number: event.target.value});
  }

  handleSubmit(event) {
    this.setState({isLoading: true});

    // first we need to calculate the frequency of the second number
    const freq = 440 * Math.pow(2, (this.state.number / 12));
    // additional step to round to two decimal places for readability in component
    const freqRounded = Number(Math.round(parseFloat(freq + 'e' + 2)) + 'e-' + 2);
    this.setState({frequency: freqRounded});
    //console.log('this.state.frequency: ' + this.state.frequency);
    const freqDivide = freq / 440;
    //console.log('freqDivide: ' + freqDivide);
    
    // future steps, getting Tone.Frequency() for additional info
    //const midi = this.tone.Frequency.ftom(freqRounded);  // this gives us the midi equivalent of freq
    //const SPINote = this.tone.Frequency(midi, 'midi').toNote(); // this returns the note
    //this.setState({note: SPINote});

    // base url for newton API calls
    const newtonBase = 'https://newton.now.sh/';  
    // get from API, using log function to get piano key
    fetch(newtonBase + 'log/2|' + freqDivide)
    .then(response => {
      if(response.ok) {
        return response.json();
      } else {
        throw new Error('Something went wrong...');
      }
    }) 
    .then(
      (logResults) => {
        this.setState({logResult: logResults.result});
        console.log('log result: ', logResults);

        const key = 12 * this.state.logResult + 49;
        this.setState({
          pianoKey: key,
          isLoading: false,
          displayResults: true
        });
        // console.log('state.pianoKey: ' + this.state.pianoKey);
      },
      (error) => {
        console.log(error);
        //console.log('error response: ' + error.response);
        console.log('error status: ' + error.response.status);
        this.setState({
          error,
          isLoading: false,
          displayResults: false
        });
      }
    )
    event.preventDefault();
  }
  /*
  passToResults(event) {
    updateResults(event.target.value);
  }
*/
  /*
    For playing our tone.js PolySynth with the notes we have from results
  */
  handleClick() {
    this.synth.triggerAttackRelease('440', '2n')
    this.synth.triggerAttackRelease(this.state.frequency, '2n', "+2")
    this.synth.triggerAttackRelease(['440', this.state.frequency], '1n', "+4")
  }

  render() {
    const { isLoading, error, displayResults } = this.state;
    if (error) {
      return <p>{error.message}</p>;
    }

    if (isLoading) {
      return (
        <blockquote class="blockquote text-center">
          <h2 class="mb-0">Loading...</h2>
        </blockquote>
      );
    }

    if (displayResults) {
      return (
        <div>
        {/* section for our form */}
          <div class="row">
            <form onSubmit={this.handleSubmit}>
              <fieldset>
                <div class="form-group row">
                  <div class="col-lg-4">
                    <label className="control-label" for="baseFrequency">Base Frequency (in Hertz)
                      <input className="form-control form-control-lg" type="number" placeholder="440" id="baseFrequency" readOnly={true} value="440"></input>
                    </label>
                    <small id="baseFreqHelp" className="form-text text-muted">
                      We are starting with the "Middle A" (A4) with a frequency of 440Hz
                    </small>
                  </div>

                  <div class="col-lg-4">
                    <label className="control-label" for="userInput">Semitones
                      {/*The musical scale goes from C0 to B8, giving us the range of -57 to 50 for semitones options*/}
                      <input className="form-control form-control-lg" type="number" placeholder="0" id="userInput" min="-57" max="50" step="1" value={this.state.number} onChange={this.handleChange}></input>
                    </label>
                    <small id="semitonesHelp" className="form-text text-muted">
                      Enter how many semitones you would like to add or subtract from A4 
                      (integer numbers only ranging from -57 to 50).
                    </small>
                  </div>

                  <div class="col-lg-3">
                    <br></br>
                    <input type="submit" className="btn btn-outline-primary btn-lg btn-block" value="Calculate" />
                  </div>
                </div>
              </fieldset>
            </form>
          </div>

          <hr class="my-4" />
          {/* section for our results card */}
          <div class="card border-success mb-3">
            <h3 div class="card-header">Results</h3>
            <div class="card-body">
              <h4 class="card-title">Consonance/Dissonance?</h4>
              <p class="card-text">After calculating....</p>
              <table class="table table-secondary">
                <thead>
                  <tr>
                    <th scope="col">Characteristic</th>
                    <th scope="col">First Note</th>
                    <th scope="col">Second Note</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="table-dark">
                    <th scope="row">Frequency</th>
                    <td>440</td>
                    <td>{this.state.frequency}</td>
                  </tr>
                  <tr class="table-dark">
                    <th scope="row">Key on Piano</th>
                    <td>49</td>
                    <td>{this.state.pianoKey}</td>
                  </tr>
                </tbody>
                {/* future: get these working, but in table
                Note: {this.state.note}
                Fraction: {this.state.ratio}
                */}
              </table>
              <div class="card-body">
                <button type="button" class="btn btn-outline-primary btn-block" onClick={this.handleClick}>
                  Play notes together</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div class="row">
        <form onSubmit={this.handleSubmit}>
          <fieldset>
            <div class="form-group row">
              <div class="col-lg-4">
                <label className="control-label" for="baseFrequency">Base Frequency (in Hertz)
                  <input className="form-control form-control-lg" type="number" placeholder="440" id="baseFrequency" readOnly={true} value="440"></input>
                </label>
                <small id="baseFreqHelp" className="form-text text-muted">
                  We are starting with the "Middle A" (A4) with a frequency of 440Hz
                </small>
              </div>

              <div class="col-lg-4">
                <label className="control-label" for="userInput">Semitones
                  {/*The musical scale goes from C0 to B8, giving us the range of -57 to 50 for semitones options*/}
                  <input className="form-control form-control-lg" type="number" placeholder="0" id="userInput" min="-57" max="50" step="1" value={this.state.number} onChange={this.handleChange}></input>
                </label>
                <small id="semitonesHelp" className="form-text text-muted">
                  Enter how many semitones you would like to add or subtract from A4 
                  (integer numbers only ranging from -57 to 50).
                </small>
              </div>

              <div class="col-lg-3">
                <br></br>
                <input type="submit" className="btn btn-outline-primary btn-lg btn-block" value="Calculate" />
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    );
  } 
}


/*  
  After user submits form, results are rendered and displayed in this component.
  Future state: put this back as a separate component

class Results extends Component {
  constructor(props) {
    super(props);
    this.state = {freq: 440, note: "A4", pianoKey: 49, ratio: "1"};

    this.handleClick = this.handleClick.bind(this);
    updateResults = updateResults.bind(this);
  }
  
  handleClick() {
    this.setState(state => ({
      //axios shit
    }));
  }

  render() {
    return (
      <div class="card text-white bg-success mb-3">
        <h3 div class="card-header">Results</h3>
        <div class="card-body">
          <h4 class="card-title">Consonance/Dissonance?</h4>
          <p class="card-text">After calculating....</p>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">Note: {this.state.note}</li>
            <li class="list-group-item">Key on Piano: {this.state.pianoKey}</li>
            <li class="list-group-item">Frequency: {this.state.freq}</li>
            <li class="list-group-item">Fraction: {this.state.ratio}</li>
          </ul>
          <div class="card-body">
            <button type="button" class="btn btn-outline-success" onClick={this.handleClick}>
              Play notes</button>
          </div>
        </div>
      </div>
    );
  }
  
}
*/
var port = process.env.PORT || 8080;
App.listen(port, () => console.log('Server is listening on port ' + {port}));

export default App;
