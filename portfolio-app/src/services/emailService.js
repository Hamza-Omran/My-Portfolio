export const EMAIL_CONFIG = {
  fromEmail: 'hamza770440@gmail.com',     
  toEmail: 'hamza.hussain.omran@gmail.com', 
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
};

export const sendEmail = async (formData) => {
  try {
    const response = await fetch(`${EMAIL_CONFIG.backendUrl}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        message: formData.message
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return { 
        success: true, 
        message: data.message || 'Email sent successfully!'
      };
    } else {
      throw new Error(data.error || 'Failed to send email');
    }
    
  } catch (error) {
    console.error('Email sending error:', error);
    
    if (error.message.includes('fetch')) {
      return { 
        success: false, 
        error: 'Email server is not running. Please start the backend server.' 
      };
    }
    
    return { 
      success: false, 
      error: error.message || 'Failed to send email' 
    };
  }
};

export const sendEmailViaMailto = (formData) => {
  const subject = encodeURIComponent(`Message from ${formData.email}`);
  const body = encodeURIComponent(`The user name is ${formData.name}\nThe message is ${formData.message}`);
  
  const mailtoLink = `mailto:${EMAIL_CONFIG.toEmail}?subject=${subject}&body=${body}`;
  window.open(mailtoLink);
  
  return { success: true };
};

export const checkEmailServerHealth = async () => {
  try {
    const response = await fetch(`${EMAIL_CONFIG.backendUrl}/health`);
    const data = await response.json();
    return { online: true, status: data.status };
  } catch (error) {
    return { online: false, error: error.message };
  }
};
