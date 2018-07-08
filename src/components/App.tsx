import * as React from "react";

import { Mode } from "../card";
import { Lexicon, Range, Slice } from "../lexicon";

import { About } from "./About";
import { Deck } from "./Deck";
import { Home } from "./Home";

export interface Props {
  lexicon: Lexicon;
}

interface State {
  page: {
    home?: { range: Range };
    deck?: { slice: Slice; mode: Mode; range: Range };
    about?: {};
  };
  volatile: { soundEnabled: boolean };
}

interface Route {
  pattern: RegExp;
  handler: (
    location: Location,
    matchData: RegExpMatchArray
  ) => State["page"] | undefined;
}

const defaultPage = { home: { range: {} } };

export class App extends React.Component<Props, State> {
  protected routes: Route[];

  constructor(props: Props) {
    super(props);
    this.routes = [];

    this.routes.push({
      pattern: /^\/about(\/)?$/,
      handler: this.hydrateAbout
    });

    this.routes.push({
      pattern: /^\/deck(\/.*)?$/,
      handler: this.hydrateDeck
    });

    this.state = {
      page: this.hydratePage(window.location),
      volatile: { soundEnabled: false }
    };
  }

  public componentDidMount() {
    window.addEventListener("popstate", this.handlePopState);
    history.replaceState(this.state.page, undefined);
  }

  public componentWillUnMount() {
    window.removeEventListener("popstate", this.handlePopState);
  }

  public hydratePage(location: Location): State["page"] {
    let page;

    for (const route of this.routes) {
      const matchData = location.pathname.match(route.pattern);
      if (matchData) {
        page = route.handler(location, matchData);
        break;
      }
    }

    return page || defaultPage;
  }

  public hydrateDeck: Route["handler"] = (location, matchData) => {
    let range = {};
    if (matchData[1]) {
      range = this.subpathToRange(matchData[1]);
    }

    const slice = this.rangeToSlice(range);
    if (!slice) {
      window.location.href = "/";
      return;
    }

    const mode: Mode =
      new URLSearchParams(location.search).get("mode") === "en-kr"
        ? "en-kr"
        : "kr-en";

    return { deck: { slice, mode, range } };
  };

  public hydrateAbout: Route["handler"] = () => {
    return { about: {} };
  };

  public rangeToSlice(range: Range): Slice | undefined {
    if (this.props.lexicon.validateRange(range)) {
      return this.props.lexicon.slice(range);
    }
  }

  public subpathToRange(path: string): Range {
    const segments = path.split("/");
    const cast = (segment: string) =>
      segment ? Number(segment) - 1 : undefined;

    return {
      level: cast(segments[1]),
      lesson: cast(segments[2]),
      start: cast(segments[3]),
      end: cast(segments[4])
    };
  }

  public rangeToSubPath(range: Range): string {
    const cast = (val: number | undefined): string | undefined =>
      typeof val === "number" ? String(val + 1) : undefined;
    return [
      "",
      cast(range.level),
      cast(range.lesson),
      cast(range.start),
      cast(range.end)
    ]
      .filter(segment => typeof segment === "string")
      .join("/");
  }

  public deckPath(range: Range, mode: Mode) {
    return `/deck${this.rangeToSubPath(range)}?mode=${mode}`;
  }

  public handleNavigate = (
    e: React.SyntheticEvent<HTMLAnchorElement>,
    pageState = {}
  ) => {
    e.preventDefault();
    const pathname = e.currentTarget.pathname;
    const location: Location = { ...window.location, pathname };
    const page = this.hydratePage(location);
    Object.assign(page[Object.keys(page)[0] as keyof State["page"]], pageState);
    this.setState({ page }, () => {
      history.pushState(page, undefined, pathname);
    });
  };

  public handleRangeSubmit = (range: Range, mode: Mode) => {
    if (this.props.lexicon.validateRange(range)) {
      const slice = this.props.lexicon.slice(range);
      const path = this.deckPath(range, mode);
      const deck = { slice, mode, range };
      history.replaceState({ home: { range } }, undefined);
      this.setState({ page: { deck } }, () =>
        history.pushState({ deck }, undefined, path)
      );
    } else {
      alert("Invalid range!");
    }
  };

  public handlePopState = (event: PopStateEvent) => {
    this.setState({ page: event.state });
  };

  public handleDeckShuffle = () => {
    if (this.state.page.deck) {
      const slice = this.props.lexicon.shuffle(
        this.state.page.deck.slice,
        true
      );
      const deck = { ...this.state.page.deck, slice };
      const newState = { page: { deck } };
      this.setState(newState, () => {
        history.replaceState({ deck }, undefined);
      });
    }
  };

  public handleDeckFlip = () => {
    if (this.state.page.deck) {
      const range = this.state.page.deck.range;
      const mode: Mode =
        this.state.page.deck.mode === "en-kr" ? "kr-en" : "en-kr";
      const deck = { ...this.state.page.deck, mode };
      this.setState({ page: { deck } }, () => {
        history.replaceState({ deck }, undefined, this.deckPath(range, mode));
      });
    }
  };

  public handleSoundToggle = () => {
    this.setState({
      volatile: {
        ...this.state.volatile,
        soundEnabled: !this.state.volatile.soundEnabled
      }
    });
  };

  public Page = (): JSX.Element => {
    if (this.state.page.home) {
      return (
        <Home
          lexicon={this.props.lexicon}
          initialRange={this.state.page.home.range}
          onSubmit={this.handleRangeSubmit}
          onNavigate={this.handleNavigate}
        />
      );
    }

    if (this.state.page.deck) {
      return (
        <Deck
          {...this.state.page.deck}
          lexicon={this.props.lexicon}
          soundEnabled={this.state.volatile.soundEnabled}
          onNavigate={this.handleNavigate}
          onShuffle={this.handleDeckShuffle}
          onFlip={this.handleDeckFlip}
          onSoundToggle={this.handleSoundToggle}
        />
      );
    }

    if (this.state.page.about) {
      return <About onNavigate={this.handleNavigate} />;
    }

    return <div />;
  };

  public render(): JSX.Element {
    return (
      <main role="main" className="container-fluid mt-3 mt-md-4 mb-3 mt-md-4">
        <this.Page />
      </main>
    );
  }
}
