import Mousetrap from "mousetrap";
import * as React from "react";

import { Card, Mode } from "../card";
import { Lexicon, Range, Slice } from "../lexicon";

export interface Props {
  slice: Slice;
  mode: Mode;
  range: Range;
  lexicon: Lexicon;
  soundEnabled: boolean;
  onNavigate: (
    e: React.SyntheticEvent<HTMLAnchorElement>,
    pageState: { range: Range }
  ) => void;
  onShuffle: () => void;
  onFlip: () => void;
  onSoundToggle: () => void;
}

interface State {
  position: number;
  showAnswer: boolean;
  showMenu: boolean;
}

export class Deck extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      position: 0,
      showAnswer: false,
      showMenu: false
    };
  }

  public componentDidMount() {
    Mousetrap.bind(["left", "j"], this.handleShowPreviousCardKeyPress);
    Mousetrap.bind(["right", "l"], this.handleShowNextCardKeyPress);
    Mousetrap.bind("space", this.handleToggleAnswerKeyPress);
    Mousetrap.bind("r", this.handleShuffleKeyPress);
    Mousetrap.bind("f", this.handleFlipKeyPress);
    Mousetrap.bind("s", this.handleSoundToggleKeyPress);
    Mousetrap.bind("m", this.handleMenuToggleKeyPress);
    Mousetrap.bind("esc", this.handleMenuHideKeyPress);

    if (this.props.mode === "kr-en") {
      this.utterCard();
    }
  }

  public componentWillUnmount() {
    Mousetrap.unbind([
      "left",
      "j",
      "right",
      "l",
      "space",
      "r",
      "f",
      "s",
      "m",
      "esc"
    ]);
  }

  public card(): Card {
    return new Card(
      this.props.lexicon,
      this.props.slice[this.state.position],
      this.props.mode
    );
  }

  public showPreviousCard() {
    if (this.state.position > 0) {
      this.showNewCard(-1);
    }
  }
  public showNextCard() {
    if (this.state.position < this.props.slice.length - 1) {
      this.showNewCard(1);
    }
  }

  public showNewCard(delta: number) {
    this.setState(
      { position: this.state.position + delta, showAnswer: false },
      () => {
        if (this.props.mode === "kr-en") {
          this.utterCard();
        }
      }
    );
  }

  public toggleMenu() {
    this.setState({ showMenu: !this.state.showMenu });
  }

  public toggleAnswer() {
    this.setState({ showAnswer: !this.state.showAnswer }, () => {
      if (this.state.showAnswer && this.props.mode === "en-kr") {
        this.utterCard();
      }
    });
  }

  public utterCard() {
    if (this.props.soundEnabled) {
      const utterance = new SpeechSynthesisUtterance(this.card().korean);
      utterance.lang = "ko-KR";
      utterance.rate = 0.72;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  }

  public cardTitle(): string {
    const card = this.card();
    let title = "All Levels";

    if (typeof this.props.range.level === "undefined") {
      return title;
    }

    title = `Level ${card.level}`;

    if (typeof this.props.range.lesson === "undefined") {
      return title;
    }

    title += ` › Lesson ${card.lesson}`;

    if (
      typeof this.props.range.start === "undefined" ||
      typeof this.props.range.end === "undefined" ||
      this.props.range.end - this.props.range.start + 1 >=
        this.props.lexicon.countWords(
          this.props.range.level,
          this.props.range.lesson
        )
    ) {
      return title;
    }

    title += ` (${this.props.range.start + 1}:${this.props.range.end + 1})`;

    return title;
  }

  public handleShowPreviousCardClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    this.showPreviousCard();
  };

  public handleShowNextCardClick = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    this.showNextCard();
  };

  public handleToggleAnswerClick = () => {
    this.toggleAnswer();
  };

  public handleCardClick = (e: React.SyntheticEvent) => {
    if (this.state.showMenu) {
      e.stopPropagation();
      this.toggleMenu();
    }
  };

  public handleMenuToggleClick = () => {
    this.toggleMenu();
  };

  public handleMenuClick = () => {
    this.toggleMenu();
  };

  public handleShuffleClick = () => {
    this.setState({ position: 0 }, () => {
      this.props.onShuffle();
    });
  };

  public handleFlipClick = () => {
    this.props.onFlip();
  };

  public handleSoundToggleClick = () => {
    this.props.onSoundToggle();
  };

  public handleShowPreviousCardKeyPress = () => {
    if (!this.state.showMenu) {
      this.showPreviousCard();
    }
  };

  public handleShowNextCardKeyPress = () => {
    if (!this.state.showMenu) {
      this.showNextCard();
    }
  };

  public handleToggleAnswerKeyPress = () => {
    if (!this.state.showMenu) {
      this.toggleAnswer();
    }
  };

  public handleShuffleKeyPress = () => {
    if (this.state.showMenu) {
      this.toggleMenu();
    }
    this.setState({ position: 0 }, () => {
      this.props.onShuffle();
    });
  };

  public handleFlipKeyPress = () => {
    if (this.state.showMenu) {
      this.toggleMenu();
    }
    this.props.onFlip();
  };

  public handleSoundToggleKeyPress = () => {
    this.props.onSoundToggle();
  };

  public handleMenuToggleKeyPress = () => {
    this.toggleMenu();
  };

  public handleMenuHideKeyPress = () => {
    if (this.state.showMenu) {
      this.toggleMenu();
    }
  };

  public handleUnwantedButtonFocus = (
    e: React.SyntheticEvent<HTMLButtonElement>
  ) => {
    e.currentTarget.blur();
  };

  public renderHeader() {
    const progress = String(
      (this.state.position / (this.props.slice.length - 1)) * 100 + "%"
    );

    return (
      <div
        className="card-header deck-card-header d-flex justify-content-between align-items-center"
        style={{
          borderImageSource: `linear-gradient(to right,var(--blue) ${progress},var(--card-border-color) ${progress})`
        }}
      >
        <a
          href="/"
          className="text-muted"
          onClick={e => this.props.onNavigate(e, { range: this.props.range })}
        >
          <i className="material-icons">arrow_back</i>
        </a>
        <span className="text-small text-muted">{this.cardTitle()}</span>
        <button
          type="button"
          onClick={this.handleMenuToggleClick}
          onFocus={this.handleUnwantedButtonFocus}
          className="text-muted"
        >
          <i className="material-icons">menu</i>
        </button>
      </div>
    );
  }

  public renderMenu() {
    return (
      <ul
        className="deck-menu list-group list-group-flush"
        onClick={this.handleMenuClick}
      >
        <li className="list-group-item" onClick={this.handleShuffleClick}>
          <i className="material-icons">shuffle</i>
          Shuffle
        </li>
        <li className="list-group-item" onClick={this.handleFlipClick}>
          <i className="material-icons flip">compare_arrows</i>
          Flip
        </li>
        <li className="list-group-item" onClick={this.handleSoundToggleClick}>
          <i className="material-icons">
            {this.props.soundEnabled ? "volume_off" : "volume_up"}
          </i>
          {this.props.soundEnabled ? "Sound Off" : "Sound On"}
        </li>
      </ul>
    );
  }

  public renderQuestion(card: Card) {
    return (
      <div
        className="card-body deck-card-body"
        onClickCapture={this.handleCardClick}
      >
        <span className="text-center">{card.question}</span>
      </div>
    );
  }

  public renderAnswer(card: Card) {
    return (
      <div
        className="card-body deck-card-body"
        onClick={this.handleToggleAnswerClick}
        onClickCapture={this.handleCardClick}
      >
        <span className="text-center">
          {this.state.showAnswer ? card.answer : "?"}
        </span>
        <button
          className={`card-control left ${
            this.state.position === 0 ? "text-muted" : ""
          }`}
          onClick={this.handleShowPreviousCardClick}
          tabIndex={-1}
          onFocus={this.handleUnwantedButtonFocus}
        >
          <i className="material-icons">chevron_left</i>
        </button>
        <button
          className={`card-control right ${
            this.state.position === this.props.slice.length - 1
              ? "text-muted"
              : ""
          }`}
          onClick={this.handleShowNextCardClick}
          tabIndex={-1}
          onFocus={this.handleUnwantedButtonFocus}
        >
          <i className="material-icons">chevron_right</i>
        </button>
      </div>
    );
  }

  public render() {
    const card = this.card();

    return (
      <div className={`card deck ${this.state.showMenu ? "menu-open" : ""}`}>
        {this.renderHeader()}
        {this.renderMenu()}
        {this.renderQuestion(card)}
        {this.renderAnswer(card)}
      </div>
    );
  }
}
