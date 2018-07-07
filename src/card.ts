import { Address, Lexicon, LocatedWord } from "./lexicon";

export type Mode = "kr-en" | "en-kr";

export class Card {
  protected word: LocatedWord;

  constructor(
    protected lexicon: Lexicon,
    protected address: Address,
    protected mode: Mode
  ) {
    this.word = lexicon.locateWord(this.address);
  }

  get question(): string {
    return this.mode === "kr-en" ? this.word.korean : this.word.english;
  }

  get answer(): string {
    return this.mode === "kr-en" ? this.word.english : this.word.korean;
  }

  get korean(): string {
    return this.word.korean;
  }

  get level(): string {
    return String(this.word.level + 1);
  }

  get lesson(): string {
    return String(this.word.lesson + 1);
  }

  get index(): string {
    let s = String(this.word.index + 1);
    while (s.length < 3) {
      s = "0" + s;
    }
    return s;
  }
}
