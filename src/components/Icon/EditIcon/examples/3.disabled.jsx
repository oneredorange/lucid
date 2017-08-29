import React from 'react';
import createReactClass from 'create-react-class';
import { EditIcon } from '../../../../index';

export default createReactClass({
	render() {
		return (
			<div>
				<EditIcon isDisabled />
				<EditIcon isDisabled isBadge />
			</div>
		);
	},
});
