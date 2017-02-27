FROM kim0/minizinc

RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
RUN apt-get -qq update && apt-get -qq install -y build-essential

# Install gecode 5.0.0
WORKDIR /tmp
RUN wget -q 'http://www.gecode.org/download/gecode-5.0.0.tar.gz'
RUN tar xzf gecode-5.0.0.tar.gz
WORKDIR /tmp/gecode-5.0.0
RUN ./configure && make -j4 && make install
WORKDIR /tmp
RUN rm -rf gecode*
ENV LD_LIBRARY_PATH /usr/local/lib

# Install nodejs
RUN apt-get install -y curl && curl -sL https://deb.nodesource.com/setup_6.x | bash
RUN apt-get install -y nodejs

# Start MiniZinc service
RUN mkdir governify-designer-module-minizinc
WORKDIR /tmp/governify-designer-module-minizinc
ADD . ./
RUN npm install
EXPOSE 10081 10044
CMD node index.js