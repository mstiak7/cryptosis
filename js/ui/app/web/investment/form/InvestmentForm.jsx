import React from 'react'
import parse from 'date-fns/parse'
import createForm from '../../form/formBuilder'
import getFields from '../../../data/form/investement/investementFields'
import './form.scss'

const setDateObj = values => {
  if(!values) return values;
  values.date = parse(values.date || new Date())
  return values;
}

export default (brokerOptions, investmentTypeOptions, values) => createForm(
  'investmentForm',
  1,
  getFields(brokerOptions, investmentTypeOptions),
  setDateObj(values)
)
