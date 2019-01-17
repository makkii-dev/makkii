const BORDER_COLOR = '#8c8a8a';
const FONT_COLOR = '#777676';

export default styles = {
	stack_header: {
		height: 40,
		fontSize: 20,
		elevation: 1,       // android shadow
		shadowOpacity: 1,   // ios shadow
		paddingTop:0,
	},
	stack_header_title: {
    	fontSize: 18,
    	alignSelf: 'center',
    	marginTop: 0,
  	},
  	container: {
  		padding: 20,
  	},
  	form: {
  		marginBottom: 20,
  	},
  	label: {
  		fontSize: 14,
  		lineHeight: 14,
  		color: FONT_COLOR,
  	},
	_button: {
		_view: {
			borderColor: BORDER_COLOR,
			borderWidth: 1,
			borderRadius: 5,
			paddingTop: 10,
			paddingBottom: 10,
		},
		_text: {
			fontSize: 20,
			lineHeight: 20,
			fontWeight: 'normal',
			textAlign: 'center',
		}
	},
	_input: {
		_view: {},
		_text_input: {
			fontSize: 16,
			color: FONT_COLOR,
			fontWeight: 'normal',
			lineHeight: 20,
			paddingTop: 5,
			paddingBottom: 5,
			paddingLeft: 5,
			paddingRight: 60,
			borderColor: BORDER_COLOR,
			borderBottomWidth: 1,
			width: '100%',
		},
		_text: {
			fontSize: 16,
			color: FONT_COLOR,
			fontWeight: 'normal',
			lineHeight: 20,
			width: 50,
			position: 'absolute',
			right: 0,
			top: 9,
		}
	},
	_password: {
		_view: {
			width: '100%'
		},
		_text_input: {
			fontSize: 16,
			color: FONT_COLOR,
			fontWeight: 'normal',
			lineHeight: 20,
			paddingTop: 5,
			paddingBottom: 5,
			paddingLeft: 5,
			paddingRight: 60,
			borderColor: BORDER_COLOR,
			borderBottomWidth: 1,
			width: '100%',
		},
		_text: {
			fontSize: 16,
			color: FONT_COLOR,
			fontWeight: 'normal',
			lineHeight: 20,
			width: 50,
			position: 'absolute',
			right: 0,
			top: 9,
		}
	}
};