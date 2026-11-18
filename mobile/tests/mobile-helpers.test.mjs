import assert from 'node:assert/strict';
import test from 'node:test';
import getRouteParam from '../src/utils/getRouteParam.js';
import getErrorMessage from '../src/utils/getErrorMessage.js';
import { isCourseManager } from '../src/features/courses/courseAccess.js';

test('route params use the first value when Expo Router returns an array', () => {
  assert.equal(getRouteParam(['course-1', 'ignored']), 'course-1');
});

test('route params preserve a single string or missing value', () => {
  assert.equal(getRouteParam('course-1'), 'course-1');
  assert.equal(getRouteParam(undefined), undefined);
});

test('course manager access is limited to the course lecturer or an admin', () => {
  const course = { lecturer: { _id: 'lecturer-1' } };

  assert.equal(isCourseManager(course, { _id: 'lecturer-1', role: 'lecturer' }), true);
  assert.equal(isCourseManager(course, { _id: 'admin-1', role: 'admin' }), true);
  assert.equal(isCourseManager(course, { _id: 'student-1', role: 'student' }), false);
});

test('API errors prefer the server message and otherwise use a useful fallback', () => {
  assert.equal(getErrorMessage({ response: { data: { message: 'Wrong key' } } }, 'Could not enrol'), 'Wrong key');
  assert.equal(getErrorMessage({ message: 'offline' }, 'Could not enrol'), 'Could not enrol: offline');
  assert.equal(getErrorMessage({}, 'Could not enrol'), 'Could not enrol');
});
