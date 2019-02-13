import {Dimensions} from 'react-native'; 

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
      	alignSelf: 'center',
        textAlign: 'center',
        flex: 1
    },
  	container: { 
  		padding: 20,
  		height: Dimensions.get('window').height, 
  	},
  	center: {
  		flex: 1,
  		justifyContent:'center',
		alignItems: 'center',
  	},
  	center_text: {
  		textAlign: 'center',
  	},
  	marginTop10: {   
		marginTop: 10,
	},
	marginTop20: {  
		marginTop: 10,
	},
	marginTop40: {  
		marginTop: 10,
	},
	marginTop60: {   
		marginTop: 10,
	},
	marginTop80: {   
		marginTop: 10,
	},
  	marginBottom10: {  
		marginBottom: 10,
	},
  	marginBottom20: { 
  		marginBottom: 20,
  	},
  	marginBottom40: {   
  		marginBottom: 40,
  	},
  	marginBottom80: {  
  		marginBottom: 80,
  	},
    instruction: {
        fontSize: 16,
        lineHeight: 16,
        color: FONT_COLOR,
    },
    input_multi_lines: {
		borderWidth: 1,
		borderRadius: 5,
		color: FONT_COLOR,
		borderColor: BORDER_COLOR,
		fontSize: 16,
		textAlignVertical: 'top'
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
			paddingRight: 45,
			borderColor: BORDER_COLOR,
			borderBottomWidth: 1,
			flex: 1,
		},
		text: {
			fontSize: 12,
			color: FONT_COLOR,
			fontWeight: 'normal',
			lineHeight: 31, 
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
			paddingLeft: 30,
			paddingRight: 40,
			flexDirection: 'row',
			justifyContent: 'flex-start',
		},
		buttonContainer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			padding: 20,
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
	},
	VaultHome:{
		slideOutContainer:{
			flex:1,
			flexDirection: 'row',
			margin:0,
			justifyContent: 'flex-end',
		},
		slideBtn:{
			width: 100,
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: 10
		},
		accountContainer:{
			height: 100,
			justifyContent: 'space-between',
			flexDirection: 'row',
			padding: 10,
			borderRadius: 10
		},
		accountLeftView:{
			alignItems: 'flex-start',
			justifyContent: 'space-between',
			padding: 10,
			flex:2
		},
		accountRightView:{
			flex:1,
			justifyContent: 'center',
			alignItems: 'flex-start'
		},
		accountNameView:{
			flexDirection: 'row',
			alignItems: 'center'
		},
		addressFontStyle:{
			color:'#fff',
			fontSize: 10,
			textAlign: 'auto',
		}
	},
	SendView:{
		container: {
			flex:1,
			justifyContent: 'flex-start',
			alignItems: 'center'
		},
		labelView:{
			margin: 10,
			borderColor: '#000',
			borderWidth: 0.1,
		},
		qrcode:{
			height: 20,
			width: 20,
			justifyContent: 'center',
			alignItems: 'center',
			margin: 10,
		},
		AdvancedBtn:{
			height:50,
			paddingLeft: 10,
			paddingRight: 10,
			marginRight: 90,
			marginLeft: 90,
			backgroundColor:'#6600ff',
			borderRadius:10,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center'
		},
		SendBtn:{
			marginBottom: 10,
			marginRight: 20,
			marginLeft: 20,
			marginTop: 20,
			flexDirection:'row',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor:'#6600ff',
			borderRadius:10,
			height:50,
		}
	}
};