import PropTypes from 'prop-types';
import PropTypesPresenter from 'utils/PropTypesPresenter';

export default new PropTypesPresenter(
  {
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.text,
    author: PropTypes.object,
    assignee: PropTypes.object,
    state: PropTypes.string,
  },
  {
    taskName(task) {
      return `${this.name(task)}`;
    },

    taskDescription(task) {
      return `${this.description(task)}`;
    },

    taskAssignee(task) {
      return this.assignee(task);
    },

    taskAuthor(task) {
      return this.author(task);
    },

    taskState(task) {
      return `${this.state(task)}`;
    },
  },
);

export const states = [
  { key: 'new_task', value: 'New' },
  { key: 'in_development', value: 'In Dev' },
  { key: 'in_qa', value: 'In QA' },
  { key: 'in_code_review', value: 'in CR' },
  { key: 'ready_for_release', value: 'Ready for release' },
  { key: 'released', value: 'Released' },
  { key: 'archived', value: 'Archived' },
];
