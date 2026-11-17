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
  dashboardPage: {
    flex: 1,
    padding: 24,
    paddingTop: 56,
    backgroundColor: '#f5f7fb',
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#172033',
  },
  dashboardWelcome: {
    marginTop: 6,
    fontSize: 16,
    color: '#555',
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#e8eef7',
  },
  logoutButtonText: {
    color: '#243a5a',
    fontWeight: '600',
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 22,
    fontWeight: '700',
    color: '#172033',
  },
  loadingCourses: {
    paddingTop: 32,
  },
  courseList: {
    paddingBottom: 24,
  },
  courseCard: {
    marginBottom: 14,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e8f0',
  },
  courseCode: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#2a78d6',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#172033',
  },
  courseDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  courseLecturer: {
    marginTop: 12,
    fontSize: 13,
    color: '#697386',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textButton: {
    padding: 8,
  },
  textButtonLabel: {
    color: '#2a78d6',
    fontWeight: '600',
  },
  browseButton: {
    marginBottom: 14,
    padding: 13,
    borderRadius: 8,
    backgroundColor: '#e8eef7',
  },
  browseButtonText: {
    textAlign: 'center',
    color: '#243a5a',
    fontWeight: '600',
  },
  courseListArea: {
    flex: 1,
  },
  browsePage: {
    flex: 1,
    padding: 24,
    paddingTop: 56,
    backgroundColor: '#f5f7fb',
  },
  browseHeader: {
    marginBottom: 18,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingVertical: 8,
  },
  courseKeyInput: {
    marginTop: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#cbd3df',
    borderRadius: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  enrolledLabel: {
    marginTop: 14,
    color: '#167344',
    fontSize: 15,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseOpenLabel: {
    marginTop: 14,
    color: '#2a78d6',
    fontWeight: '600',
  },
  formPage: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  detailPage: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 48,
    backgroundColor: '#f5f7fb',
  },
  courseDetailCard: {
    marginTop: 22,
    marginBottom: 18,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e8f0',
  },
  detailTitle: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: '700',
    color: '#172033',
  },
  detailDescription: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    color: '#454f60',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  secondaryAction: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e8eef7',
  },
  dangerAction: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff0f0',
  },
  dangerButtonText: {
    color: '#a52626',
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff7e8',
  },
  materialCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e3e8f0',
  },
  materialType: {
    marginBottom: 6,
    color: '#2a78d6',
    fontSize: 12,
    fontWeight: '700',
  },
  studentRow: {
    marginBottom: 8,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});

export default authStyles;
