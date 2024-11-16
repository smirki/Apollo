import sqlite3
import requests

# SQLite database name (used for pulling prospects)
db_name = "apollo_prospects.db"

def ollama_generate(model, prompt, system_instruction=None):
    url = "https://ollama.golockedin.com/api/generate"
    headers = {"Content-Type": "application/json"}
    data = {
        "model": model,
        "prompt": prompt,
        "system": system_instruction,
        "stream": False,
        "seed": 1
    }
    try:
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()
        response_data = response.json()
        return response_data['response']
    except requests.RequestException as e:
        print(f"Error with Ollama API: {e}")
        return ""

def draft_email(name, company):
    email_template = f"""
    Write this email with the provided information. Put the subject after subject: Output nothing other than the email. Stick to the template.

    Subject: ________ 

    Hi {name},
    
    My name is Rohan Shirumalla, and I came across your work at {company}. I was really impressed with what you’ve been doing and thought I’d reach out. I believe we might have shared interests and was hoping to explore potential opportunities to collaborate or learn more about your work.
    
    I'd love to connect and discuss this further. Please feel free to let me know if you have some time for a quick chat.
    
    Best regards,
    Rohan Shirumalla

    Info: Name - {name}, Company - {company}
    """
    
    system_instruction = "Write an email. Include name and company. Only output the email and the subject."
    
    response = ollama_generate("llama3.1:8b-instruct-q4_0", email_template, system_instruction)
    
    subject_line = "No Subject"  # Fallback subject line
    if response.startswith("Subject:"):
        try:
            subject_line, response = response.split("\n", 1)
            subject_line = subject_line.replace("Subject:", "").strip()
        except ValueError:
            print(f"Error extracting subject from response: {response}")

    return response, subject_line

def send_email(name, email, company):
    email_content, subject = draft_email(name, company)
    
    # Normally, you would integrate with an email sending service like SMTP, SendGrid, etc.
    # For demonstration, we are just printing the email.
    print(f"Sending email to: {email}")
    print(f"Subject: {subject}")
    print(email_content)
    print("-" * 40)

def fetch_prospects_and_send_emails():
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    cursor.execute('SELECT name, email, organization_name FROM prospects')
    prospects = cursor.fetchall()

    for name, email, company in prospects:
        if email:  # Ensure the email is valid before sending
            send_email(name, email, company)

    conn.close()

# Run the function to fetch prospects and send emails
fetch_prospects_and_send_emails()
