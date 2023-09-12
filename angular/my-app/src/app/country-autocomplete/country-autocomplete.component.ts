import { Component, EventEmitter, Input, Output } from '@angular/core';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface GraphQLResponse {
  data?: {
    countryAutoComplete: string[];
  };
}

@Component({
  selector: 'app-country-autocomplete',
  templateUrl: './country-autocomplete.component.html',
})
export class CountryAutocompleteComponent {
  @Input() selectedValue: string | null = null;
  @Output() selectedValueChange = new EventEmitter<string | null>();
  suggestions: string[] = [];
  showSuggestions = true;
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
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.fetchSuggestions(term)),
    ).subscribe(suggestions => this.suggestions = suggestions);
  }

  handleInput(event: any): void {
    this.showSuggestions = true;
    this.selectedValueChange.emit(null);
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
    const queryStr = `query {countryAutoComplete(substring: "${query}")}`
    return this.http.post<GraphQLResponse>('https://enterprise-search.mytomorrows.com/gql/graphql', { query: queryStr })
      .toPromise()
      .then(response => {
        if (response && response.data) {
          return response.data.countryAutoComplete;
        } else {
          throw new Error('Response or response data is undefined');
        }
      })
      .catch(() => {
        alert('Something went wrong. Please contact beta@mytomorrows.com.');
        return [];
      });
  }
}