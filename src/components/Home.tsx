import * as React from "react";

import { Mode } from "../card";
import { Lexicon, Range } from "../lexicon";

import shield from "../assets/yonsei-shield.svg";

export interface Props {
  lexicon: Lexicon;
  initialRange: Range;
  onSubmit: (range: Range, mode: Mode) => void;
  onNavigate: (e: React.SyntheticEvent<HTMLAnchorElement>) => void;
}

type State = Range;

export class Home extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = this.props.initialRange;
  }

  public handleLevelChange = (e: React.SyntheticEvent<HTMLSelectElement>) => {
    this.setState({
      level: e.currentTarget.value ? Number(e.currentTarget.value) : undefined,
      lesson: undefined,
      start: undefined,
      end: undefined
    });
  };

  public handleLessonChange = (e: React.SyntheticEvent<HTMLSelectElement>) => {
    const newState: State = {};
    if (e.currentTarget.value && typeof this.state.level === "number") {
      newState.lesson = Number(e.currentTarget.value);
      newState.start = 0;
      newState.end =
        this.props.lexicon.countWords(this.state.level, newState.lesson) - 1;
    } else {
      newState.lesson = newState.start = newState.end = undefined;
    }
    this.setState(newState);
  };

  public handleRangeChange(
    field: "start" | "end"
  ): React.EventHandler<React.SyntheticEvent> {
    return (e: React.SyntheticEvent<HTMLInputElement>) => {
      this.setState({
        [field]: e.currentTarget.value
          ? Number(e.currentTarget.value) - 1
          : undefined
      });
    };
  }

  public handleSubmitClick(mode: Mode): (e: React.SyntheticEvent) => void {
    return (event: React.SyntheticEvent) => {
      event.preventDefault();
      this.props.onSubmit(this.state, mode);
    };
  }

  public renderSelectLevel = (): JSX.Element => {
    const options: JSX.Element[] = [
      <option value="" key={0}>
        All Levels
      </option>
    ];

    const levelCount = this.props.lexicon.countLevels();
    for (let i = 0; i < levelCount; i++) {
      options.push(
        <option value={i} key={i + 1}>
          Level {i + 1}
        </option>
      );
    }

    return (
      <select
        value={this.state.level}
        className="form-control"
        id="level"
        onChange={this.handleLevelChange}
      >
        {options}
      </select>
    );
  };

  public renderSelectLesson = (): JSX.Element => {
    const options: JSX.Element[] = [
      <option value="" key={0}>
        All Lessons
      </option>
    ];

    if (typeof this.state.level === "number") {
      const lessonCount = this.props.lexicon.countLessons(this.state.level!);
      for (let i = 0; i < lessonCount; i++) {
        options.push(
          <option value={i} key={i + 1}>
            Lesson {i + 1}
          </option>
        );
      }
    }

    return (
      <select
        value={this.state.lesson}
        className="form-control"
        id="lesson"
        onChange={this.handleLessonChange}
        disabled={typeof this.state.level !== "number"}
      >
        {options}
      </select>
    );
  };

  public renderSelectRange = (): JSX.Element => {
    let max = 0;
    if (
      typeof this.state.level === "number" &&
      typeof this.state.lesson === "number"
    ) {
      max = this.props.lexicon.countWords(
        this.state.level!,
        this.state.lesson!
      );
    }

    return (
      <div className="container-fluid">
        <div className="row">
          <input
            type="number"
            className="form-control col"
            placeholder="Min."
            pattern="[0-9]*"
            min={1}
            max={max}
            disabled={max === 0}
            onChange={this.handleRangeChange("start")}
            value={
              typeof this.state.start === "number" ? this.state.start + 1 : ""
            }
          />
          <span className="col-auto d-flex justify-content-center flex-column">
            to
          </span>
          <input
            type="number"
            className="form-control col"
            placeholder="Max."
            pattern="[0-9]*"
            min={1}
            max={max}
            disabled={max === 0}
            onChange={this.handleRangeChange("end")}
            value={typeof this.state.end === "number" ? this.state.end + 1 : ""}
          />
        </div>
      </div>
    );
  };

  public render(): JSX.Element {
    return (
      <div className="card home">
        <div className="card-body d-flex flex-column">
          <h1>Yonsei KLI Wordbook</h1>
          <p className="lead text-muted">
            Pick a level, lesson and range to get a shuffled deck of words.
          </p>
          <form>
            <div className="form-group">{this.renderSelectLevel()}</div>
            <div className="form-group">{this.renderSelectLesson()}</div>
            <div className="form-group">{this.renderSelectRange()}</div>
            <div className="from-group mt-sm-4">
              <div className="row submit-buttons">
                <div className="col-sm mb-3">
                  <button
                    type="submit"
                    onClick={this.handleSubmitClick("kr-en")}
                    className="btn btn-primary"
                  >
                    Korean → English
                  </button>
                </div>
                <div className="col-sm mb-3">
                  <button
                    type="submit"
                    onClick={this.handleSubmitClick("en-kr")}
                    className="btn btn-primary"
                  >
                    English → Korean
                  </button>
                </div>
              </div>
            </div>
          </form>
          <div className="shield-container d-flex align-items-center justify-content-center mb-3">
            <img src={shield} className="shield" />
          </div>
          <a href="/about" onClick={this.props.onNavigate}>
            <small className="align-self-center mt-auto">About</small>
          </a>
        </div>
      </div>
    );
  }
}
