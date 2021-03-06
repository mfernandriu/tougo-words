import { Component, OnInit } from '@angular/core';
import { SearchEnglishRelatedWordsService } from '../search-english-related-words.service';
import { RelatedWord } from '../related-word';
import { TranslateEnglishRelatedWordsService } from '../translate-english-related-words.service';
import { TranslatedWord } from '../translated-word';
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-related-words-searcher',
  templateUrl: './related-words-searcher.component.html',
  styleUrls: ['./related-words-searcher.component.css'],
})
export class RelatedWordsSearcherComponent implements OnInit {
  word: string = 'flower';
  relatedWords: RelatedWord[] = [];
  translatedWords: TranslatedWord[] = [];
  translatedWordsLinks: string[] = [];

  relatedWordsComponents: {
    word: string,
    translatedWord: string,
    translatedWordLink: string
  }[] = [];

  maxNumberOfWords = 20;

  constructor(
    private searchEnglishRelatedWordsService: SearchEnglishRelatedWordsService,
    private translateEnglishRelatedWordsService: TranslateEnglishRelatedWordsService
  ) {}

  ngOnInit(): void {}

  onSearch(): void {
    this.resetLists()
    this.searchEnglishRelatedWordsService
      .search(this.word)
      .subscribe((relatedWords) => {
        this.setRelatedWords(relatedWords);
        this.translateRelatedWordsAndSetMoreThings(relatedWords);
      });
  }

  private resetLists() {
    this.relatedWords = []
    this.translatedWords = []
    this.translatedWordsLinks = []
    this.translatedWordsLinks = []
  }

  private setRelatedWords(relatedWords: RelatedWord[]) {
    relatedWords = relatedWords.slice(0, this.maxNumberOfWords);
    this.relatedWords = relatedWords;
  }

  translateRelatedWordsAndSetMoreThings(relatedWords: RelatedWord[]) {
    const translatedWordsObservables = this.getTranslatedWordsObservables(
      relatedWords
    );
    forkJoin(translatedWordsObservables).subscribe((translatedWords) => {
      this.setTranslatedWords(translatedWords);
      this.setTranslatedWordsLinks(translatedWords);
      this.setRelatedWordsComponents();
    });
  }

  private getTranslatedWordsObservables(
    relatedWords: RelatedWord[]
  ): Observable<TranslatedWord>[] {
    let translatedWordsObservables: Observable<TranslatedWord>[] = [];
    for (const relatedWord of relatedWords) {
      const translatedWordObservable = this.translateEnglishRelatedWordsService.translateWord(
        relatedWord
      );
      translatedWordsObservables.push(translatedWordObservable);
    }
    return translatedWordsObservables;
  }

  private setTranslatedWords(translatedWords: TranslatedWord[]) {
    this.translatedWords = translatedWords;
  }

  private setTranslatedWordsLinks(translatedWords: TranslatedWord[]) {
    this.translatedWordsLinks = translatedWords.map(
      this.generateTranslatedWordLink
    );
  }

  generateTranslatedWordLink(translatedWord: TranslatedWord): string {
    const translatedWordText =
      translatedWord.data.translations[0].translatedText;
    const link = 'https://jisho.org/search/' + translatedWordText;
    return link;
  }

  private setRelatedWordsComponents() {
    for (let index = 0; index < this.relatedWords.length; index++) {
      const relatedWordComponent = {
        word: this.relatedWords[index].word,
        translatedWord: this.translatedWords[index].data.translations[0].translatedText,
        translatedWordLink: this.translatedWordsLinks[index]    
      }
      this.relatedWordsComponents.push(relatedWordComponent)
    }
  } 
}
