import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { Card, CardBody, CardHeader } from '../../../content/card';
import validate from '../../../../../utils/validate-schema';
import { editIssue, postIssue } from '../../../../../resources/issues';
import { API_REQUEST_EXCEPTION_CODES } from '../../../../../exceptions/exceptions-types';
import { ApiRequestException } from '../../../../../exceptions/api-request-exceptions';
import './index.scss';


const IssueSchema = yup.object({
  title: yup.string().required(),
  priority: yup.string().required(),
  label: yup.array().of(yup.string()).min(1, "Label cannot be empty").required(),
})

function CreateEditIssue({ history, location }) {
  const issue = location && location.state.state.issue ? location.state.state.issue : null;
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(values){
    try{
      setIsLoading(true)
      console.log(values)
      if(issue){
        await editIssue({
          _id: issue._id,
          title: values.title,
          priority: values.priority,
          label: values.label
        });
        setIsLoading(false)
        toast.success("Issue updated successfully")
      } else {
        await postIssue(values);
        history.push('/issues');
        toast.success("Issue created successfully")
      }
    }
    catch(err){
      toast.error(err.message);
      setIsLoading(false)
      if(err instanceof ApiRequestException) {
        if(err.code === API_REQUEST_EXCEPTION_CODES.unauthorized){
          history.push('/login', { state: { redirectPath: location.pathname } });
        }
      }
    }
  }

  return (
    <Card>
      <CardHeader>
          <h6>{issue ? "Edit Issue" : "Post Issue"}</h6>
      </CardHeader>
      <CardBody>
        <Formik
          initialValues={issue??{
            title: "",
            priority: "mid",
            label: []
          }}
          validate={validate(IssueSchema)}
          onSubmit={onSubmit}
        >
          <Form>
            <InputField type="text" name="title" desc="Title" placeholder='Issue title' disabled={isLoading} />
            <SelectField name="priority" desc="Priority" items={["high", "mid", "low"]} disabled={isLoading} />
            <IssueCustomSelectField name="label" desc="Label" options={[
              { value: 'electrical', label: 'electrical' },
              { value: 'mechanical', label: 'mechanical' },
              { value: 'landscape', label: 'landscape' }
            ]} disabled={isLoading} />
            <div className="cl-issue-form-row cl-issue-form-button ">
              <button type="submit">
                POST ISSUE
              </button>
            </div>
          </Form>
        </Formik>
      </CardBody>
    </Card>
  );
}

CreateEditIssue.propTypes = {
  history: PropTypes.any,
  location: PropTypes.any,
};

function InputField({ type, name, desc, placeholder, disabled }) {
  return (
    <div className='cl-issue-form-row'>
      <label>{desc}</label>
      <Field type={type} name={name} placeholder={placeholder} disabled={disabled} />
      <ErrorMessage name={name}>
        {
          (msg) => (
              <label className="cl-issue-form-error-message">
                {msg}
              </label>
          )
        }
      </ErrorMessage>
    </div>
  );
}

InputField.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

function SelectField({ name, desc, items, disabled }) {
  return (
    <div className='cl-issue-form-row cl-issue-form-select-type'>
      <label>{desc}</label>
      <Field style={{width: "100%"}} as="select" name={name} className="form-select form-select-lg" disabled={disabled}>
      {
        items.map(item => <option key={item} value={item}>{item}</option>)
      }
      </Field>
      <ErrorMessage name={name}>
        {
          (msg) => (
              <label className="cl-issue-form-error-message">
                {msg}
              </label>
          )
        }
      </ErrorMessage>
    </div>
  );
}

SelectField.propTypes = {
  name: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string),
  disabled: PropTypes.bool,
};

function IssueCustomSelectField({ name, desc, options, disabled }) {
  return (
    <div className='cl-issue-form-row'>
      <label>{desc}</label>
      <Field className="haha" name={name} component={CustomSelectField} options={options} isMulti disabled={disabled} />
      <ErrorMessage name={name}>
        {
          (msg) => (
              <label className="cl-issue-form-error-message">
                {msg}
              </label>
          )
        }
      </ErrorMessage>
    </div>
  );
}

IssueCustomSelectField.propTypes = {
  name: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  field: PropTypes.any,
  form: PropTypes.any,
  isMulti: PropTypes.bool,
  disabled: PropTypes.bool,
};

function CustomSelectField({ options, field, form, isMulti, disabled }) {
  const value = isMulti ? field.value && Array.isArray(field.value) ? field.value.map(v => ({
    value: v,
    label: v
  })) : [] : ""

  function onChange(option) {
    console.log(option)
    form.setFieldValue(
      field.name,
        !isMulti ? option.value
        : isMulti && option !== null ? option.map((item) => item.value)
        : []
    );
  }

  return (
      <Select style={{width: "100%"}}
        name={field.name} 
        options={options} 
        defaultValue={value}
        // defaultValue={[{
        //   value: field.value[0],
        //   label: field.value[0]
        // }]}
        onChange={onChange}
        onBlur={field.onBlur}
        isMulti={isMulti} 
        disabled={disabled}
      >
      </Select>
  );
}

CustomSelectField.propTypes = {
  options: PropTypes.array.isRequired,
  field: PropTypes.any,
  form: PropTypes.any,
  isMulti: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default CreateEditIssue;
