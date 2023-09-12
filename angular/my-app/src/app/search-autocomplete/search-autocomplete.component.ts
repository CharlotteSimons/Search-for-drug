import { Component, EventEmitter, Input, Output } from '@angular/core';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface ResponseType {
  data: {
    autoComplete: Array<{ alias: string }>
  };
}

@Component({
  selector: 'app-search-autocomplete',
  templateUrl: './search-autocomplete.component.html',
})
export class SearchAutocompleteComponent {
  @Input() selectedValue: string = '';
  @Output() selectedValueChange = new EventEmitter<string>();
  suggestions: string[] = [];
  showSuggestions = false;
  value = '';
  valid: boolean | null = null;
  private searchTerms = new Subject<string>();

  constructor(private http: HttpClient) {}

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => this.fetchSuggestions(term)),
    ).subscribe(suggestions => this.suggestions = suggestions);
  }

  handleInput(event: any): void {
    this.showSuggestions = true;
    this.selectedValueChange.emit('');
    this.value = event.target.value || '';
    this.search(this.value);
  }

  handleSelect(suggestion: string): void {
    this.value = suggestion;
    this.selectedValueChange.emit(suggestion);
    this.suggestions = [];
    this.showSuggestions = false;
    this.valid = true;
  }

  fetchSuggestions(query: string) {
    if (query.length < 2) {
      return [];
    }
    const queryStr = `query {autoComplete(substring: "${query}") {alias}}`;
    return this.http.post<ResponseType>('https://enterprise-search.mytomorrows.com/gql/graphql', { query: queryStr })
      .toPromise()
      .then(response => {
        if (response && response.data) {
          return response.data.autoComplete.map(item => item.alias);
        } else {
          throw new Error('Response or response data is undefined');
        }
      })
      .catch(() => {
        alert('Something went wrong. Please try again later.');
        return [];
      });
    }
}