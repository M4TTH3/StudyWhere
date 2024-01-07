FROM python:3.10-slim

# Copy the files over
COPY . .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Fix the time issue of connection
RUN apt-get update
RUN apt-get install ntp -y

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "flask_app:app"]
