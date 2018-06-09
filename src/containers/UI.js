import React from 'react';
import styled from 'styled-components';

const UI = styled.div`
	position: absolute;
	top: 0px;
	width: 100%;
	height: 100%;
	
	display: flex;
	align-items: flex-end;
	justify-content: center;
	
	font-size: 20px;
`;

export default () => (
	<UI>Record button</UI>
);
