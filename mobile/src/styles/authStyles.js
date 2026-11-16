import { StyleSheet } from 'react-native';

const authStyles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 8,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 24,
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  input: {
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    marginTop: 8,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#2a78d6',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    marginTop: 16,
    padding: 12,
  },
  secondaryButtonText: {
    color: '#2a78d6',
    fontSize: 15,
    textAlign: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
    color: '#333',
  },
  roleRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
  },
  roleButtonSelected: {
    borderColor: '#2a78d6',
    backgroundColor: '#eaf3ff',
  },
  roleButtonText: {
    textAlign: 'center',
    color: '#333',
  },
});

export default authStyles;
