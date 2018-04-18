import 'normalize.css';
import Rx from 'rxjs';
import {
  getRepos,
  getUser
} from './helper';
import {
  reposTemplate,
  userTemplate
} from './templates';
import '../css/base.css';

const showUserInfo = ($dom, data) => {
  $dom.html(userTemplate(data));
};

const userInfoStream = ($repos) => {
  const $avator = $repos.find('.user_header');
  const avatorMouseoverObservable = Rx.Observable.fromEvent($avator, 'mouseover')
    .debounceTime(500)
    .takeWhile((e) => {
      const $infosWrapper = $(e.target).parent().find('.user_infos_wrapper');
      return $infosWrapper.find('.infos_container').length === 0;
    })
    .map((e) => {
      const $infosWrapper = $(e.target).parent().find('.user_infos_wrapper');
      return {
        conatiner: $infosWrapper,
        url: $(e.target).attr('data-api')
      }
    })
    .filter((data) => !!data.url)
    .switchMap(getUser)
    .do((result) => {
      const {data, conatiner} = result;
      showUserInfo(conatiner, data);
    });

  return avatorMouseoverObservable;
};

$(() => {
  const $conatiner = $('.content_container');
  const $input = $('.search');
  const observable = Rx.Observable.fromEvent($input, 'keyup')
    .debounceTime(400)
    .map(() => $input.val().trim())
    .filter((text) => !!text)
    .distinctUntilChanged()
    .switchMap(text => {
      return getRepos(text);
    })
    .do((results) => {
      $conatiner.html('');
    })
    .flatMap(results => {
      return Rx.Observable.from(results);
    })
    .map((repos) => $(reposTemplate(repos)))
    .do(($repos) => {
      $conatiner.append($repos);
    })
    .flatMap(($repos) => {
      return userInfoStream($repos);
    });

  observable.subscribe(() => {
    console.log('success');
  }, (err) => {
    console.log(err);
  }, () => {
    console.log('completed');
  });
});
