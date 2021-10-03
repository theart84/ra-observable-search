import { ofType } from "redux-observable";
import { ajax } from "rxjs/ajax";
import {
  map,
  tap,
  retry,
  filter,
  debounceTime,
  switchMap,
  catchError,
  takeWhile,
  mergeMap,
  concatMap,
} from "rxjs/operators";
import {
  CHANGE_SEARCH_FIELD,
  SEARCH_SKILLS_REQUEST,
} from "../actions/actionTypes";
import {
  searchSkillsRequest,
  searchSkillsSuccess,
  searchSkillsFailure,
  clearListItems,
} from "../actions/actionCreators";
import { of } from "rxjs";

export const changeSearchEpic = (action$) =>
  action$.pipe(
    ofType(CHANGE_SEARCH_FIELD),
    map((o) => o.payload.search.trim()),
    debounceTime(100),
    map((o) => searchSkillsRequest(o))
  );

export const searchSkillsEpic = (action$) =>
  action$.pipe(
    ofType(SEARCH_SKILLS_REQUEST),
    map((o) => o.payload.search),
    map((o) => new URLSearchParams({ q: o })),
    tap((o) => console.log(o)),
    switchMap((o) => {
      if (o.get("q") === "") {
        return of(clearListItems());
      }
      return ajax.getJSON(`${process.env.REACT_APP_SEARCH_URL}?${o}`).pipe(
        retry(3),
        map((o) => searchSkillsSuccess(o)),
        catchError((e) => of(searchSkillsFailure(e)))
      );
    })
  );
