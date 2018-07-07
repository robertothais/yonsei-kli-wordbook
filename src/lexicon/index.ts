import shuffleArray from "shuffle-array";

import level1 from "./data/level-1";

interface RawLesson {
  [key: string]: string;
}
type RawLevel = RawLesson[];

const RAW_LEVELS: RawLevel[] = [level1];

type Word = [string, string];
type Lesson = Word[];
type Level = Lesson[];

export type Address = number;
export type Slice = Address[];
export interface LocatedWord {
  level: number;
  lesson: number;
  index: number;
  korean: Word[0];
  english: Word[1];
}

export interface Range {
  level?: number;
  lesson?: number;
  start?: number;
  end?: number;
}

export class Lexicon {
  public levels: Level[];

  constructor() {
    this.levels = this.buildLevels();
  }

  public countLevels(): number {
    return this.levels.length;
  }

  public countLessons(level: number): number {
    return this.levels[level].length;
  }

  public countWords(level: number, lesson: number): number {
    return this.levels[level][lesson].length;
  }

  public locateWord(address: Address): LocatedWord {
    const level = address >> 12;
    const lesson = (address >> 8) & 0b111;
    const index = address & 0b11111111;
    const word = this.levels[level][lesson][index];
    return {
      level,
      lesson,
      index,
      korean: word[0],
      english: word[1]
    };
  }

  public slice(range: Range, shuffle: boolean = true): Slice {
    const slice = this.sliceLevels(range);

    if (shuffle) {
      this.shuffle(slice);
    }

    return slice;
  }

  public shuffle(slice: Slice, copy: boolean = false): Slice {
    return shuffleArray(slice, { copy });
  }

  public validateRange(range: Range): boolean {
    if (typeof range.level === "undefined") {
      return true;
    }

    if (
      !Number.isInteger(range.level) ||
      range.level < 0 ||
      range.level >= this.countLevels()
    ) {
      return false;
    }

    // If we have a valid level but no lesson, we have a valid range.
    if (typeof range.lesson === "undefined") {
      return true;
    }

    if (
      !Number.isInteger(range.lesson) ||
      range.lesson < 0 ||
      range.lesson >= this.countLessons(range.level)
    ) {
      return false;
    }

    // If we have a valid level and lesson, but an incomplete word  window, we
    // have a valid range.
    if (
      typeof range.start === "undefined" ||
      typeof range.end === "undefined"
    ) {
      return true;
    }

    // Range values need to be positive.
    if (
      !Number.isInteger(range.start) ||
      !Number.isInteger(range.end) ||
      range.start < 0 ||
      range.end < 0
    ) {
      return false;
    }

    // Start cannot be larger than end.
    if (range.start > range.end) {
      return false;
    }

    if (range.end >= this.countWords(range.level, range.lesson)) {
      return false;
    }

    return true;
  }

  protected buildLevels(): Level[] {
    return RAW_LEVELS.map(rawLevel => this.buildLessons(rawLevel));
  }

  protected buildLessons(rawLevel: RawLevel): Lesson[] {
    return rawLevel.map(rawLesson => this.buildWords(rawLesson));
  }

  protected buildWords(rawLesson: RawLesson): Word[] {
    return Object.keys(rawLesson).map(
      (korean): Word => [korean, rawLesson[korean]]
    );
  }

  protected sliceLevels(range: Range): Slice {
    let slice: Slice = [];
    if (typeof range.level === "number") {
      slice = this.sliceLessons(range.level, range);
    } else {
      this.levels.forEach((_, lesson) => {
        slice.push(...this.sliceLessons(lesson, range));
      });
    }
    return slice;
  }

  protected sliceLessons(level: number, range: Range): Slice {
    if (range && typeof range.lesson === "number") {
      return this.sliceLesson(level, range.lesson, range);
    } else {
      const slice: Slice = [];
      this.levels[level].forEach((_, lesson) => {
        slice.push(...this.sliceLesson(level, lesson, range));
      });
      return slice;
    }
  }

  /*
   *  Assumes there are no more than:
   *    - 8 levels
   *    - 16 lessons per level
   *    - 256 words per lesson
  */
  protected sliceLesson(level: number, lesson: number, range: Range): Slice {
    const start = typeof range.start === "number" ? range.start : 0;
    const end =
      typeof range.end === "number"
        ? range.end
        : this.countWords(level, lesson) - 1;
    const slice: Slice = [];
    for (let i = start; i <= end; i++) {
      slice.push((level << 12) + (lesson << 8) + i);
    }
    return slice;
  }
}
