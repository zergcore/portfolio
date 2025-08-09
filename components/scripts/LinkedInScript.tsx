import Script from 'next/script';

const LinkedInScript = () => {

  return (
    <Script id="linkedin-script" src='https://platform.linkedin.com/badges/js/profile.js' async defer type='text/javascript'>
    </Script>
  );
};

export default LinkedInScript;