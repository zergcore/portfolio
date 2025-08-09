import Box from "@mui/material/Box";

const LinkedInBadge = () => {
  return (
    <Box 
      className="w-full flex justify-center items-center row-start-3">
      <div 
        className="badge-base LI-profile-badge"
        data-locale="en_US" 
        data-size="large" 
        data-theme="dark" 
        data-type="HORIZONTAL" 
        data-vanity="zaidibethramos" 
        data-version="v1"
      >
        <a 
          className="badge-base__link LI-simple-link" 
          href="https://ve.linkedin.com/in/zaidibethramos/en?trk=profile-badge"
          aria-label="View Zaidibeth Ramos LinkedIn Profile"
        >
        </a>
      </div>    
    </Box>
  )
}

export default LinkedInBadge;