import * as React from "react";

export interface Props {
  onNavigate: (e: React.SyntheticEvent<HTMLAnchorElement>) => void;
}

export function About(props: Props) {
  const year = String(new Date().getFullYear());

  return (
    <div className="card about">
      <div className="card-body d-flex flex-column justify-content-between">
        <div>
          <h1>About</h1>
          <p>안녕하세요!</p>
          <p>
            I'm studying Korean at Yonsei University's{" "}
            <a href="http://www.yskli.com/_en/default.asp">
              Korean Language Institute
            </a>{" "}
            in Seoul. I built this website to help me retain vocabulary and
            study for the (almost daily) quizzes in the program.
          </p>
          <p>
            It's meant to supplement the vocabulary book used in class, but
            anyone learning Korean may find it useful.
          </p>
          <p>
            The source of this application is open and freely{" "}
            <a href="https://github.com/robertothais/yonsei-kli-wordbook">
              available
            </a>{" "}
            on Github.
          </p>
        </div>
        <div>
          <h2>Keyboard shortcuts</h2>
          <dl className="row">
            <dt className="col-6 col-md-3">previous card</dt>
            <dd className="col-6 col-md-3">left arrow, j</dd>
            <dt className="col-6 col-md-3">next card </dt>
            <dd className="col-6 col-md-3">right arrow, l</dd>
            <dt className="col-6 col-md-3">toggle answer</dt>
            <dd className="col-6 col-md-3">space</dd>
            <dt className="col-6 col-md-3">shuffle deck</dt>
            <dd className="col-6 col-md-3">r</dd>
            <dt className="col-6 col-md-3">flip deck</dt>
            <dd className="col-6 col-md-3">f</dd>
            <dt className="col-6 col-md-3">toggle sound</dt>
            <dd className="col-6 col-md-3">s</dd>
            <dt className="col-6 col-md-3">show menu</dt>
            <dd className="col-6 col-md-3">m</dd>
          </dl>
        </div>
        <div>
          <p>
            <a href="/" onClick={props.onNavigate} className="align-self-right">
              Back
            </a>
          </p>
          <small className="text-muted">
            Copyright {year} ©{" "}
            <a href="https://robertothais.org">Roberto Thais</a>
          </small>
        </div>
      </div>
    </div>
  );
}
