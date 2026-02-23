import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AppLayout from './AppLayout';
import ProfileSetupModal from '../auth/ProfileSetupModal';
import { useGetCallerUserProfile } from '../../hooks/useQueries';

export default function RootComponent() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <AppLayout />
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}
