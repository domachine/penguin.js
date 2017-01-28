import { createValueSelector, isEditable } from '../selectors'
import { update } from '../actions'

export default function createInplace (ownProps, el) {
  const { store, field } = ownProps
  if (!field) {
    if (!el) return ''
    console.error('Inplace needs a \'field\' prop to work on')
    return
  }
  const calcProps = createPropCalculator(ownProps)
  return {
    componentDidMount () {
      if (el) el.oninput = onInput
      store.subscribe(onUpdate)
    },
    render: onUpdate
  }

  function onUpdate () {
    return render(calcProps(store.getState()), el)
  }

  function onInput (e) {
    const value = e.target.innerText
    store.dispatch(update({ [field]: value }))
  }
}

function createPropCalculator (props) {
  const value = createValueSelector()
  return function calcProps (state) {
    const v = value(state, props.field)
    return Object.assign({
      value: v == null ? (props.innerHTML || '') : v
    }, {
      isEditable: isEditable(state)
    })
  }
}

function render (props, el) {
  const { value, isEditable } = props
  if (!el) return props.value
  const contenteditable = isEditable ? 'true' : 'false'
  if (el.getAttribute('contenteditable') !== contenteditable) {
    el.setAttribute('contenteditable', contenteditable)
  }
  if (el.innerText !== value) el.innerText = value
}
