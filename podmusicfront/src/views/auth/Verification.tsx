import {useEffect, useRef, useState} from 'react';
import {Keyboard, StyleSheet, Text, TextInput, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from 'src/@types/navigation';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import client from 'src/api/client';
import colors from 'src/constants/colors';
import AppLink from '@ui/Link';
import AuthFormContainer from '@components/AuthFormContainer';
import OTPField from '@ui/OTPField';
import Button from '@ui/Button';
import catchAsyncError from 'src/api/catchError';
import {updateNotification} from 'src/store/notification';
import {useDispatch} from 'react-redux';

type Props = NativeStackScreenProps<AuthStackParamList, 'Verification'>;

const otpFields = new Array(6).fill('');

const Verification = ({route}: Props) => {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const [otp, setOtp] = useState([...otpFields]);
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [coundDown, setCoundDown] = useState(60);
  const [canSendNewOtpRequest, setCanSendNewOtpRequest] = useState(false);

  const dispatch = useDispatch();

  const {userInfo} = route.params;

  const inputRef = useRef<TextInput>(null);

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];

    if (value === 'Backspace') {
      // moves to the previous only if the field is empty
      if (!newOtp[index]) {
        setActiveOtpIndex(index - 1);
      }
      newOtp[index] = '';
    } else {
      // update otp and move to the next
      setActiveOtpIndex(index + 1);
      newOtp[index] = value;
    }

    setOtp([...newOtp]);
  };

  const handlePaste = (value: string) => {
    if (value.length === 6) {
      Keyboard.dismiss();
      const newOtp = value.split('');
      setOtp([...newOtp]);
    }
  };

  const isValidOtp = otp.every(value => {
    return value.trim();
  });

  const handleSubmit = async () => {
    if (!isValidOtp) {
      return dispatch(
        updateNotification({message: 'Invalid OTP!', type: 'error'}),
      );
    }

    setSubmitting(true);
    try {
      const {data} = await client.post('/auth/verify-email', {
        userId: userInfo.id,
        token: otp.join(''),
      });
      dispatch(updateNotification({message: data, type: 'success'}));

      // navigate back to sign in
      navigation.navigate('SignIn');
    } catch (error) {
      const errorMessage = catchAsyncError(error);
      dispatch(updateNotification({message: errorMessage, type: 'error'}));
    }
    setSubmitting(false);
  };

  const requestForOTP = async () => {
    setCoundDown(60);
    setCanSendNewOtpRequest(false);
    try {
      await client.post('/auth/re-verify-email', {
        userId: userInfo.id,
      });
    } catch (error) {
      console.log('Requesting for new otp: ', error);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeOtpIndex]);

  useEffect(() => {
    if (canSendNewOtpRequest) {
      return;
    }

    const intervalId = setInterval(() => {
      setCoundDown(oldCountDown => {
        if (oldCountDown <= 0) {
          setCanSendNewOtpRequest(true);
          clearInterval(intervalId);

          return 0;
        }
        return oldCountDown - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [canSendNewOtpRequest]);

  return (
    <AuthFormContainer heading="Please look at your email.">
      <View style={styles.inputContainer}>
        {otpFields.map((_, index) => {
          return (
            <OTPField
              ref={activeOtpIndex === index ? inputRef : null}
              key={index}
              placeholder="-"
              onKeyPress={({nativeEvent}) => {
                handleChange(nativeEvent.key, index);
              }}
              onChangeText={handlePaste}
              keyboardType="numeric"
              value={otp[index] || ''}
            />
          );
        })}
      </View>

      <Button busy={submitting} title="Submit" onPress={handleSubmit} />

      <View style={styles.linkContainer}>
        {coundDown > 0 ? (
          <Text style={styles.countDown}>{coundDown} sec</Text>
        ) : null}
        <AppLink
          active={canSendNewOtpRequest}
          title="Re-send OTP"
          onPress={requestForOTP}
        />
      </View>
    </AuthFormContainer>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  linkContainer: {
    marginTop: 20,
    width: '100%',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  countDown: {
    color: colors.SECONDARY,
    marginRight: 7,
  },
});

export default Verification;
