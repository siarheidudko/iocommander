/*
IoCommander v1.0.0
https://github.com/siarheidudko/iocommander
(c) 2018 by Siarhei Dudko.
https://github.com/siarheidudko/iocommander/LICENSE
*/
/*
"use strict"
const mapStateToProps = (state) => {
  return {
    todos: state.todos
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    onTodoClick: (id) => {
      dispatch(toggleTodo(id))
    }
  }
}
var AddTodo = connect(mapStateToProps, mapDispatchToProps)(AddTodo)

function connect(mapStateToProps, mapDispatchToProps) {
  return function (AdminIoCommanderPanel) {
	return class extends React.Component{
		render() {
			return (
				<AdminIoCommanderPanel>
					{store.getState()}
				</AdminIoCommanderPanel>
			)
		}
	}
  }
}

ReactDOM.render(
	<ReactRedux.Provider store={serverStorage}>
		<AdminIoCommanderPanel />
	</ReactRedux.Provider>,
	document.getElementById('AdminIoCommander')
);