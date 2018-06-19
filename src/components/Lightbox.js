import React from 'react';
import styled from 'styled-components';

const Center = styled.div`
	height: 100%;

	display: flex;
	align-items: center;
	justify-content: center;
`;

const Blackout = styled.div`
	width: 100%;
	height: 100%;

	background-color: black;
	opacity: 0.5;
`;

const Text = styled.div`
	position: absolute;
	width: 80vmin;
	height: 100%;

	display: flex;
	align-items: center;
	justify-content: center;
`;

const Lightbox = (props) => (
	<Center>
		<Blackout/>
		<Text>{props.children}</Text>
	</Center>
)

export default Lightbox;
