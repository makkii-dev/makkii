const BORDER_COLOR = '#8c8a8a';
const FONT_COLOR = '#777676';

export default styles = {
	headerStyle: {
        shadowOpacity: 0,
        shadowOffset: { height: 0, width:0 }, 
        shadowRadius: 0, 
        borderBottomWidth:0,
        elevation: 1,
        fontWeight: 'normal',
    },
    headerTitleStyle: {
      	fontWeight: 'normal',
      	fontSize: 18,
    },
  	container: {
  		paddingLeft: 20,
  		paddingRight: 20,
  		paddingTop: 40,
  		paddingBottom: 40,
		justifyContent:'flex-start',
  		flex:1,
  	},
  	center: {
  		flex: 1,
  		justifyContent:'center',
		alignItems: 'center',
  	},
  	center_text: {
  		textAlign: 'center',
  	},
  	marginTop10: {   // in use
		marginTop: 10,
	},
	marginTop20: {   // in use
		marginTop: 10,
	},
	marginTop40: {   // in use
		marginTop: 10,
	},
  	marginBottom10: {   // in use
		marginBottom: 10,
	},
  	marginBottom20: {   // in use
  		marginBottom: 20,
  	},
  	marginBottom40: {   // in use
  		marginBottom: 40,
  	},
  	marginBottom80: {   // in use
  		marginBottom: 80,
  	},
  	label: {            // in use
  		fontSize: 14,
  		lineHeight: 14,
  		color: FONT_COLOR,
  	},
    instruction: {
        fontSize: 16,
        lineHeight: 16,
        color: FONT_COLOR,
    },
    title_label: {
        fontSize: 18,
        lineHeight: 18,
        color: 'black',
    },
	input: {
		text_input: {
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
		text: {
			fontSize: 16,
			color: FONT_COLOR,
			fontWeight: 'normal',
			lineHeight: 20,
			width: 50,
			position: 'absolute',
			right: 0,
			top: 9,
		},
		textAreaContainer: {
			borderWidth: 1,
			borderColor: 'gray',
			padding: 5
		}
	},
	password: {
		view: {
			flexDirection: 'row',
			height: 50,
			alignItems: 'center'
		},
		text_input: {
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
			flex: 1,
		},
		text: {
			fontSize: 12,
			color: FONT_COLOR,
			fontWeight: 'normal',
			lineHeight: 20,
			flex: 1,
			position: 'absolute',
			right: 0,
			top: 9,
		}
	},
	ImportList:{
		container:{
			flex:1,
			height: 80,
			flexDirection: 'row',
			justifyContent: 'flex-start',
			alignItems: 'center',
			padding: 10,
			backgroundColor:'#fff'
		},
		itemImage:{
			marginRight: 20,
			width: 50,
			height: 50,
		},
		ItemText:{
			textAlign: 'right',
		},
		footer:{
			flexDirection:'row',
			height:24,
			justifyContent:'center',
			alignItems:'center',
			marginBottom:10,
			marginTop: 10,
		}
	},
	Account:{
		summaryContainer:{
			flexDirection: 'row',
			justifyContent: 'space-between',
			padding: 20,
		},
		summaryLeftContainer:{
			justifyContent: 'space-between',
			padding: 10,
			alignItems: 'flex-start'
		},
		addressView: {
			margin: 30,
			justifyContent: 'flex-start',
		}
	},
	Transaction:{
		container:{
			flexDirection: 'column',
			flex:1,
			padding: 10,
			backgroundColor: "#fff",
			height: 80,
			justifyContent: 'space-between',
		},
		subContainer:{
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems:'center',
			flex:1,
		}
	}
};