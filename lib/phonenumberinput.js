// Copyright (c) 2014-Present All rights reserved.
// The Authors at Excubito Pvt Ltd.
import React, { Component } from 'react'
import { StyleSheet, Text, TextInput, View }  from 'react-native'
import PropTypes from 'prop-types'
import { parse, format, asYouType } from 'libphonenumber-js'
import CallingCodeToCCA2 from 'libphonenumber-js/metadata.min'
import Countries from './data'

export default class PhoneNumberPicker extends Component {
  static propTypes = {
    country: PropTypes.object,
    onChange: PropTypes.func,
    countryHint: PropTypes.object,
  }

  static defaultProps = {
    countryHint: {
      name: 'United States',
      cca2: 'US',
      callingCode: '1',
    },
    country: {
      name: 'United States',
      cca2: 'US',
      callingCode: '1',
    },
  }

  constructor(props) {
    super(props)

    this.state = {
      phoneNumber: '',
      country: props.countryHint,
      onChange: props.onChange,
      skipFormatAsYouType: false,
    }
  }

  componentDidMount() {
    this.phoneInput.focus()
  }

  _numberChanged = (country, callingCode, phoneNumber) => {
    callingCode = callingCode + ''
    phoneNumber = phoneNumber + ''
    callingCode = callingCode.replace(/\D/g, '')
    phoneNumber = phoneNumber.replace(/\D/g, '')
    this.state.onChange(country, callingCode, phoneNumber)
  }

  _getCountryFromCCA2 = (cca2) => {
      let countryName = '',
          callingCode = ''
      do {
        if (cca2.length > 2) {
          cca2 = ''
          break
        }

        for (let i = 0; i < Countries.length; i ++) {
          if (Countries[i].code.toUpperCase() == cca2.toUpperCase()) {
            countryName = Countries[i].name
            callingCode = Countries[i].dial_code
            break
          }
        }
      } while(0)

      if (countryName.length == 0 || cca2.length == 0 || callingCode.length == 0) {
        countryName = this.state.country.callingCode.length > 0 ? 'Invalid country code' : 'Choose a country'
        cca2 = ''
        callingCode =''
      }

      return {
        name: countryName,
        cca2,
        callingCode,
      }
  }

  _getCountryFRomCallingCode = (callingCode, phoneNumber) => {
    let cca2 = '', countryName = ''
    
    callingCode = callingCode.replace(/\D/g, '')
    phoneNumber = phoneNumber.replace(/\D/g, '')

    do {
      if (callingCode.length > 4) {
        callingCode = callingCode.slice(0, 4)
        break
      }

      if (CallingCodeToCCA2.country_phone_code_to_countries[callingCode] &&
          CallingCodeToCCA2.country_phone_code_to_countries[callingCode][0]) {
        cca2 = CallingCodeToCCA2.country_phone_code_to_countries[callingCode][0]  
      }

      let formatter = new asYouType()

      if (cca2.length == 0) {
        formatter.input(`+${callingCode}`)
        if (formatter.country !== undefined && formatter.country.length == 2) {
        cca2 = formatter.country
        }
      }

      if (cca2.length == 0) {
        formatter.input(`+${callingCode}${phoneNumber}`)
        if (formatter.country !== undefined && formatter.country.length == 2) {
          cca2 = formatter.country
        }
      }

      if (cca2.length) {
        for (let i = 0; i < Countries.length; i++) {
          if (Countries[i].code.toUpperCase() == cca2.toUpperCase()) {
            countryName = Countries[i].name
            callingCode = Countries[i].dial_code.replace(/\D/g, '')
            break
          }
        }
      }
    } while(0)

    if (countryName.length == 0 || cca2.length == 0) {
      countryName = this.state.country.callingCode.lenth > 0 ? 'Invalid country code' : 'Choose a country'
      cca2 = ''
    }

    return {
      name: countryName,
      cca2,
      callingCode,
    }
  }

  _callingCodeChanged = updatedCallingCode => {
    let countryFromCallingCode = this._getCountryFRomCallingCode(updatedCallingCode, this.state.phoneNumber)

    this.setState({ country: countryFromCallingCode })
    this._numberChanged(countryFromCallingCode, countryFromCallingCode.callingCode, this.state.phoneNumber)
    
    if (countryFromCallingCode.cca2.length) {
      this.phoneInput.focus()
    }
  }

  _phoneChanged = updatedPhoneNumber => {
    updatedPhoneNumber = updatedPhoneNumber.replace(/\D/g, '')

    let skipFormatAsYouType = updatedPhoneNumber == this.state.phoneNumber
    skipFormatAsYouType |= (updatedPhoneNumber.length < this.state.phoneNumber.length)
    this.setState({ skipFormatAsYouType, phoneNumber: updatedPhoneNumber })
    this._numberChanged(this.state.country, this.state.country.callingCode, updatedPhoneNumber)
  }

  _phoneNumberFormatAsYouType = () => {
    if (this.state.skipFormatAsYouType) {
        return this.state.phoneNumber
    }

    return new asYouType(this.state.country.cca2).input(this.state.phoneNumber)
  }

  render() {
    const { placeholder } = this.props
    const { callingCode } = this.state.country

    return (
      <View style={styles.container}>
        <TextInput
          style={styles.countryCode}
          underlineColorAndroid={'transparent'}
          onChangeText={this._callingCodeChanged}
          value={`+${callingCode}`}
          keyboardType={'phone-pad'}
          selectionColor={'white'}
          keyboardAppearance={'dark'} />
        <Text
            style={styles.seperator}
            underlineColorAndroid={'transparent'}>
            -
        </Text>
        <TextInput
          ref={n => this.phoneInput = n}
          style={styles.phoneNumber}
          underlineColorAndroid={'transparent'}
          onChangeText={this._phoneChanged}
          value={this._phoneNumberFormatAsYouType()}
          autoFocus={true}
          keyboardType={'phone-pad'}
          keyboardAppearance={'dark'}
          selectionColor={'white'} />
      </View>
    )
  }
}

const generalStyles = {
  alignItems: 'center',
  color: 'white',
  fontSize: 36,
  fontFamily: 'BarlowCondensed-Regular',
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  countryCode: {
    flexGrow: 1.25,
    ...generalStyles,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'right',
  },
  seperator: {
    flex: 0.25,
    marginLeft: 10,
    marginRight: 5,
    ...generalStyles,
  },
  phoneNumber: {
    flexGrow: 3,
    ...generalStyles,
  },
})