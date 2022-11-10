import React, { useEffect, useState } from 'react';
import KanbanBoard from '@asseinfo/react-kanban';
import '@asseinfo/react-kanban/dist/styles.css';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Switch from '@material-ui/core/Switch';
import { propOr } from 'ramda';

import TasksRepository from 'repositories/TasksRepository';
import Task from 'components/Task';
import ColumnHeader from 'components/ColumnHeader';
import TaskForm from 'forms/TaskForm';
import AddPopup from 'components/AddPopup';
import EditPopup from 'components/EditPopup';
import TaskPresenter from 'presenters/TaskPresenter';

import useStyles from './useStyles';

const STATES = [
  { key: 'new_task', value: 'New' },
  { key: 'in_development', value: 'In Dev' },
  { key: 'in_qa', value: 'In QA' },
  { key: 'in_code_review', value: 'in CR' },
  { key: 'ready_for_release', value: 'Ready for release' },
  { key: 'released', value: 'Released' },
  { key: 'archived', value: 'Archived' },
];

const initialBoard = {
  columns: STATES.map((column) => ({
    id: column.key,
    title: column.value,
    cards: [],
    meta: {},
  })),
};

const MODES = {
  ADD: 'add',
  NONE: 'none',
  EDIT: 'edit',
};

const switcherModes = {
  off: 'id ASC',
  on: 'id DESC',
};

function TaskBoard() {
  const [board, setBoard] = useState(initialBoard);
  const [boardCards, setBoardCards] = useState([]);
  const [mode, setMode] = useState(MODES.NONE);
  const [openedTaskId, setOpenedTaskId] = useState(null);
  const [switcher, setSwitcher] = useState(true);
  const styles = useStyles();

  function sorting(switcherMode) {
    return switcherMode ? switcherModes.on : switcherModes.off;
  }

  const loadColumn = (state, page, perPage) =>
    TasksRepository.index({
      q: { stateEq: state, s: sorting(switcher) },
      page,
      perPage,
    });

  const loadColumnInitial = (state, page = 1, perPage = 10) => {
    loadColumn(state, page, perPage).then(({ data }) => {
      setBoardCards((prevState) => ({
        ...prevState,
        [state]: { cards: data.items, meta: data.meta },
      }));
    });
  };

  const loadColumnMore = (state, page = 1, perPage = 10) => {
    loadColumn(state, page, perPage).then(({ data }) => {
      setBoardCards((prevState) => ({
        ...prevState,
        [state]: { cards: [...prevState[state].cards, ...data.items], meta: data.meta },
      }));
    });
  };

  const loadBoard = () => {
    STATES.map(({ key }) => loadColumnInitial(key));
  };

  const generateBoard = () => {
    const newBoard = {
      columns: STATES.map(({ key, value }) => ({
        id: key,
        title: value,
        cards: propOr({}, 'cards', boardCards[key]),
        meta: propOr({}, 'meta', boardCards[key]),
      })),
    };
    setBoard(newBoard);
  };

  const handleCardDragEnd = (task, source, destination) => {
    const transition = task.transitions.find(({ to }) => destination.toColumnId === to);
    if (!transition) {
      return null;
    }

    return TasksRepository.update(task.id, { stateEvent: transition.event })
      .then(() => {
        loadColumnInitial(destination.toColumnId);
        loadColumnInitial(source.fromColumnId);
      })
      .catch((error) => {
        alert(`Move failed! ${error.message}`); // eslint-disable-line no-alert
      });
  };

  const handleOpenAddPopup = () => {
    setMode(MODES.ADD);
  };

  const handleOpenEditPopup = (task) => {
    setOpenedTaskId(task.id);
    setMode(MODES.EDIT);
  };

  const handleClose = () => {
    setMode(MODES.NONE);
    setOpenedTaskId(null);
  };

  const handleTaskCreate = (params) => {
    const attributes = TaskForm.attributesToSubmit(params);
    return TasksRepository.create(attributes).then(({ data: { task } }) => {
      loadColumnInitial(TaskPresenter.taskState(task));
      handleClose();
    });
  };

  const loadTask = (id) => TasksRepository.show(id).then(({ data: { task } }) => task);

  const handleUpdateTask = (task) => {
    const attributes = TaskForm.attributesToSubmit(task);

    return TasksRepository.update(task.id, attributes).then(() => {
      loadColumnInitial(TaskPresenter.taskState(task));
      handleClose();
    });
  };

  const handleDestroyTask = (task) => {
    TasksRepository.destroy(task.id).then(() => {
      loadColumnInitial(TaskPresenter.taskState(task));
      handleClose();
    });
  };

  const handleSortSwitcher = () => {
    setSwitcher(!switcher);
  };

  useEffect(() => loadBoard(), []);
  useEffect(() => generateBoard(), [boardCards]);
  useEffect(() => loadBoard(), [switcher]);

  return (
    <>
      <Switch color="primary" defaultChecked onChange={handleSortSwitcher} />
      Last task first
      <Fab className={styles.addButton} color="primary" aria-label="add" onClick={handleOpenAddPopup}>
        <AddIcon />
      </Fab>
      <KanbanBoard
        onCardDragEnd={handleCardDragEnd}
        renderColumnHeader={(column) => <ColumnHeader column={column} onLoadMore={loadColumnMore} />}
        renderCard={(card) => <Task onClick={handleOpenEditPopup} task={card} />}
      >
        {board}
      </KanbanBoard>
      {mode === MODES.ADD && <AddPopup onCreateCard={handleTaskCreate} onClose={handleClose} />}
      {mode === MODES.EDIT && (
        <EditPopup
          onLoadCard={loadTask}
          onCardDestroy={handleDestroyTask}
          onCardUpdate={handleUpdateTask}
          onClose={handleClose}
          cardId={openedTaskId}
        />
      )}
    </>
  );
}

export default TaskBoard;