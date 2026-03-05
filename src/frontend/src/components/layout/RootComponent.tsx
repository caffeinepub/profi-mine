import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../../hooks/useQueries";
import ProfileSetupModal from "../auth/ProfileSetupModal";
import AppLayout from "./AppLayout";

export default function RootComponent() {
  const { identity } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <AppLayout />
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}
