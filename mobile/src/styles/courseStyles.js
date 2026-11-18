import { StyleSheet } from 'react-native';
import { colors } from './theme';

export default StyleSheet.create({
  dashboardPage: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.page,
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
    color: colors.text,
  },
  dashboardWelcome: {
    marginTop: 6,
    fontSize: 16,
    color: colors.mutedText,
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.softSurface,
  },
  logoutButtonText: {
    color: colors.secondaryText,
    fontWeight: '600',
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
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
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  courseCode: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  courseDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.mutedText,
  },
  courseLecturer: {
    marginTop: 12,
    fontSize: 13,
    color: colors.subtleText,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  browseButton: {
    marginBottom: 14,
    padding: 13,
    borderRadius: 8,
    backgroundColor: colors.softSurface,
  },
  browseButtonText: {
    textAlign: 'center',
    color: colors.secondaryText,
    fontWeight: '600',
  },
  courseListArea: {
    flex: 1,
  },
  browsePage: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.page,
  },
  browseHeader: {
    marginBottom: 18,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  courseKeyInput: {
    marginTop: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#cbd3df',
    borderRadius: 8,
    fontSize: 15,
    backgroundColor: colors.white,
  },
  enrolledLabel: {
    marginTop: 14,
    color: colors.success,
    fontSize: 15,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseOpenLabel: {
    marginTop: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  detailPage: {
    padding: 24,
    paddingBottom: 48,
    backgroundColor: colors.page,
  },
  courseDetailCard: {
    marginTop: 22,
    marginBottom: 18,
    padding: 20,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailTitle: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  detailDescription: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    color: '#454f60',
  },
  materialCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  materialType: {
    marginBottom: 6,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  studentRow: {
    marginBottom: 8,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
});
