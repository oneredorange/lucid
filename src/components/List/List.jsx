import _ from 'lodash';
import React from 'react';
import { bindClassNames } from '../../util/style-helpers';
import { createLucidComponentDefinition }  from '../../util/component-definition';
import Button from '../Button/Button';
import CaretIcon from '../Icon/CaretIcon/CaretIcon';
import * as reducers from './List.reducers';

const boundClassNames = bindClassNames('lucid-List');

const {
	func,
	arrayOf,
	bool,
	string,
	number,
	node,
	object,
} = React.PropTypes;

/**
 * {"categories": ["layout"], "madeFrom": ["Button", "CaretIcon"]}
 *
 * A component for lists of data. It supports nesting `List`s below
 * `List.Item`s and animating expanding of those sub lists. The default reducer
 * behavior is for only one `List.Item` to be selected at any given time; that
 * is easily overridden by handling `onSelect` yourself.
 */
const List = React.createClass(createLucidComponentDefinition({
	displayName: 'List',

	reducers,

	childProps: {
		Item: {
			hasExpander: bool,
			isExpanded: bool,
			isSelected: bool,
			isDisabled: bool,
			onSelect: func,
			onExpand: func,
		}
	},

	propTypes: {
		/**
		 * Regular `children` aren't really used in this component, but if you do
		 * add them they will be placed at the end of the component. You should be
		 * `List.Item`s instead of regular children.
		 */
		children: node,

		/**
		 * Appended to the component-specific class names set on the root element.
		 */
		className: string,

		/**
		 * Passed through to the root element.
		 */
		style: object,

		/**
		 * Indicates which of the `List.Item` children are currently selected. You
		 * can also put the `isSelected` prop directly on the `List.Item`s if you
		 * wish.
		 */
		selectedIndices: arrayOf(number),

		/**
		 * Indicates which of the `List.Item` children are currently expanded. You
		 * can also put the `isExpanded` prop directly on the `List.Item`s if you
		 * wish.
		 */
		expandedIndices: arrayOf(number),

		/**
		 * Callback fired when the user selects a `List.Item`.
		 *
		 * Signature: `(index, { event, props }) => {}`
		 */
		onSelect: func,

		/**
		 * Callback fired when the user expands an expandable `List.Item`.
		 *
		 * Signature: `(index, { event, props }) => {}`
		 */
		onExpand: func,

		/**
		 * Indicates whether the List should appear and act disabled by having a
		 * "greyed out" palette and ignoring user interactions.
		 */
		isDisabled: bool,
	},

	getDefaultProps() {
		return {
			onSelect: _.noop,
			onExpand: _.noop,
			isDisabled: false,
			expandedIndices: [],
			selectedIndices: [],
		};
	},

	render() {
		const {
			children,
			className,
			style,
			selectedIndices,
			expandedIndices,
			isDisabled,
			...passThroughs
		} = this.props;

		const itemChildProps = List.Item.findInAllAsProps(this.props);

		return (
			<ul
				{...passThroughs}
				className={boundClassNames('&', {
					'&-is-disabled': isDisabled,
				}, className)}
				style={style}
			>
				{_.map(itemChildProps, (itemChildProp, index) => {
					const {
						isDisabled = false,
						hasExpander = false,
					} = itemChildProp;

					const itemChildrenAsArray = React.Children.toArray(itemChildProp.children);

					// Was not able to get `child.Type` to work correctly, I suspect this
					// is due to the way we wrap components with createLucidComponentDefinition
					const listChildren = _.filter(itemChildrenAsArray, (child) => _.get(child, 'type.displayName', '') === 'List');
					const otherChildren = _.filter(itemChildrenAsArray, (child) => _.get(child, 'type.displayName', '') !== 'List');

					// If the prop is found on the child, it should override what was
					// passed in at the top level for selectedIndices and expandedIndices
					const actualIsExpanded = _.has(itemChildProp, 'isExpanded')
						? _.get(itemChildProp, 'isExpanded', true)
						: _.includes(expandedIndices, index);

					const actualIsSelected = _.has(itemChildProp, 'isSelected')
						? _.get(itemChildProp, 'isSelected', false)
						: _.includes(selectedIndices, index);

					return (
						<li
							{...itemChildProp.passThroughs}
							key={index}
							className={boundClassNames('&-Item', {
								'&-Item-has-expander': hasExpander,
								'&-Item-is-expanded': actualIsExpanded,
								'&-Item-is-selected': actualIsSelected,
								'&-Item-is-disabled': isDisabled,
							}, className)}
						>
							<a
								className={boundClassNames('&-Item-content')}
								onClick={_.partial(this.handleClickItem, index, itemChildProp)}
							>
								{otherChildren}
								{hasExpander ?
									<Button
										className={boundClassNames('&-expander')}
										size='short'
										onClick={_.partial(this.handleClickExpander, index, itemChildProp)}
									>
										<CaretIcon
											direction={actualIsExpanded ? 'up' : 'down'}
											isOpen={true}
											className={boundClassNames('&-caret', {
												'&-caret-is-selected': actualIsSelected
											})}
										/>
									</Button>
								: null}
							</a>
							{listChildren}
						</li>
					);
				})}
				{children}
			</ul>
		);
	},

	handleClickExpander(index, itemChildProp, { event }) {
		const {
			isDisabled,
			onExpand,
		} = itemChildProp;

		// Prevent the user from also selecting the current item.
		event.stopPropagation();

		if (!this.props.isDisabled && !isDisabled) {
			this.props.onExpand(index, { event, props: itemChildProp });

			if (onExpand) {
				onExpand(index, { event, props: itemChildProp });
			}
		}
	},

	handleClickItem(index, itemChildProp, event) {
		const {
			isDisabled,
			onSelect,
		} = itemChildProp;

		if (!this.props.isDisabled && !isDisabled) {
			this.props.onSelect(index, { event, props: itemChildProp });

			if (onSelect) {
				onSelect(index, { event, props: itemChildProp });
			}
		}
	}

}));

export default List;