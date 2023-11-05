import {StyleSheet, View} from 'react-native';
import * as yup from 'yup';
import React, {useState} from 'react';
import colors from '@utils/colors';
import AuthInputField from '@components/form/AuthInputField';
import Form from '@components/form';
import SubmitBtn from '@components/form/SubmitBtn';
import PasswordVisibilityIcon from '@ui/PasswordVisibilityIcon';
import Link from '@ui/Link';
import Icon from 'react-native-vector-icons/Entypo';
import AuthFormContainer from '@components/AuthFormContainer';

const signinSchema = yup.object({
  name: yup
    .string()
    .trim('Name is missing!')
    .min(3, 'Invalid name!')
    .required('Name is required'),
  email: yup
    .string()
    .trim('Email is missing!')
    .email('Invalid email!')
    .required('Email is required!'),
  password: yup
    .string()
    .trim('Password is missing!')
    .min(8, 'Password is too short!')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      'Password is too weak!',
    )
    .required('Password is required!'),
});

const initialValues = {
  name: '',
  email: '',
  password: '',
};

const SignIn = () => {
  const [secureEntry, setSecureEntry] = useState(true);

  const togglePasswordView = () => setSecureEntry(!secureEntry);

  return (
    <Form
      onSubmit={values => console.log(values)}
      initialValues={initialValues}
      validationSchema={signinSchema}>
      <AuthFormContainer heading="Welcome back">
        <View style={styles.formContainer}>
          <AuthInputField
            name="email"
            label="Email"
            placeholder="Username or email address"
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={styles.spacer}
            rightIcon={<Icon name="email" color={colors.CONTRAST} size={16} />}
          />
          <AuthInputField
            name="password"
            label="Password"
            placeholder="Password"
            autoCapitalize="none"
            secureTextEntry={secureEntry}
            containerStyle={styles.spacer}
            rightIcon={<PasswordVisibilityIcon privateIcon={secureEntry} />}
            onRightIconPress={togglePasswordView}
          />
          <SubmitBtn title="Sign in" />
          <View style={styles.linkContainer}>
            <Link title="Forgot password?" onPress={() => {}} />
            <Link title="Sign up" onPress={() => {}} />
          </View>
        </View>
      </AuthFormContainer>
    </Form>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
  },
  spacer: {
    marginBottom: 15,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default SignIn;