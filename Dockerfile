FROM isagroup/minizinc

# Install nodejs
RUN apt-get install -y curl && curl -sL https://deb.nodesource.com/setup_6.x | bash
RUN apt-get install -y nodejs && apt-get clean

# Start MiniZinc service
RUN mkdir governify-designer-module-minizinc
WORKDIR /tmp/governify-designer-module-minizinc
ADD . ./
RUN npm install
EXPOSE 80 443
CMD node index.js