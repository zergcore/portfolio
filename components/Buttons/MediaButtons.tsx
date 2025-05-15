import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Box from "@mui/material/Box";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from '@mui/icons-material/Telegram';

const MediaButtons = () => {
  return (
    <Box 
      className="w-full flex justify-center items-center row-start-3">
      <ButtonGroup 
        variant="text" 
        aria-label="Social media and contact links"
      >
        <Button
          href="https://www.linkedin.com/in/zaidibethramos"
          aria-label="LinkedIn Profile"
          target="_blank"
          rel="noopener noreferrer" // Added rel for security best practice
        >
          <LinkedInIcon />
        </Button>
        <Button
          href="https://github.com/zergcore"
          aria-label="GitHub Profile"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon />
        </Button>
        <Button 
          href="mailto:zaidibethramos@gmail.com" 
          aria-label="Send an email" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <EmailIcon />
        </Button>
        <Button 
          href="https://wa.me/584245092375" 
          aria-label="Send a WhatsApp message" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <WhatsAppIcon />
        </Button>
        <Button 
          href="https://zergcore.t.me" 
          aria-label="Send a telegram message" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <TelegramIcon />
        </Button>
      </ButtonGroup>
    </Box>
  )
}

export default MediaButtons