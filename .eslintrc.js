module.exports = {
	'extends': [
		'standard',
		'plugin:react/recommended',
	],
	'parser': 'babel-eslint',
	'env': {
		'browser': true,
		'node': true,
	},
	'rules': {
		'brace-style': ['error', 'stroustrup', {'allowSingleLine': true}],

		// SEMICOLONS
		'semi': ['error', 'always', {'omitLastInOneLineBlock': true}],
		'no-extra-semi': 'error',

		// WHITE SPACE
		'indent': ['error', 'tab', {
			'MemberExpression': 0,
			'SwitchCase': 1,
		}],
		'no-tabs': 'off',
		'spaced-comment': 'off',

		// Allow if/for without braces!
		'curly': 'off',

		// Allow aligning of Array initialization
		'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
		'no-multi-spaces': ['error', {'exceptions': {'ArrayExpression': true}}],

		// Allow for more distinct separation than common code blocks
		'no-multiple-empty-lines': ['error', {'max': 2}],

		// Less disjointed looking code
		'block-spacing': ['error', 'never'],
		'space-before-function-paren': ['error', 'never'],
		'keyword-spacing': ['error', {
			'before': true,
			'after': true,
			'overrides': {
				'if': {'after': false},
				'for': {'after': false},
				'switch': {'after': false},
			},
		}],

		// MISC
		// Possible errors
		'for-direction': 'error',
		'no-empty': 'error',

		// Best practises
		'comma-dangle': ['error', 'always-multiline'],
		'dot-notation': 'error',
		'guard-for-in': 'error',
		'no-empty-function': 'error',
		'no-else-return': 'error',
		'no-var': 'error',
		'no-useless-concat': 'error',
		// Quotes around prop names only makes sense if they are necessary
		'quote-props': ['error', 'consistent-as-needed'],
		'object-shorthand': ['error', 'always', {'avoidQuotes': true}],
		'operator-linebreak': ['error', 'after'],

		// REACT
		'react/prop-types': 'off',
		'react/no-access-state-in-setstate': 'error',
	}
};
