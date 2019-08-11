var deepNetworkClassifier = function (numClasses){
    this.numClasses = numClasses;
    this.examples = 0;
    this.getNumClasses = function () {
        return this.examples > 10 ? 1: 0;
    };
    this.model = null;
    this.truncatedMobileNet = null;
    this.init = async function () {
      const mobilenet = await tf.loadLayersModel(
          'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
    
      // Return a model that outputs an internal activation.
      const layer = mobilenet.getLayer('conv_pw_13_relu');
      this.truncatedMobileNet= tf.model({inputs: mobilenet.inputs, outputs: layer.output});

    };
    this.addExample = function (canvas, label) {
        const input = this.fromCanvas(canvas);
        const example = this.truncatedMobileNet.predict(input);
      
        // One-hot encode the label.
        const y = tf.tidy(
            () => tf.oneHot(tf.tensor1d([label]).toInt(), this.numClasses));
    
        if (this.xs == null) {
          // For the first example that gets added, keep example and y so that the
          // ControllerDataset owns the memory of the inputs. This makes sure that
          // if addExample() is called in a tf.tidy(), these Tensors will not get
          // disposed.
          this.xs = tf.keep(example);
          this.ys = tf.keep(y);
        } else {
          const oldX = this.xs;
          this.xs = tf.keep(oldX.concat(example, 0));
    
          const oldY = this.ys;
          this.ys = tf.keep(oldY.concat(y, 0));
    
          oldX.dispose();
          oldY.dispose();
          y.dispose();
        }
        this.examples ++;
      };

    this.train = async function train(numClasses, inputShape,) {
        if (this.xs == null) {
            throw new Error('Add some examples before training!');
          }

          //NOTE when hacking on this: you will need to get the output shape of the layer we're snipping 
          //out, so for example, you would call var activation = net.infer, and then get activation.shape
          //and that's what should be passed in here. might even make inputShape get passed in so 
          //we dont have to worry about it
          inputShape = this.truncatedMobileNet.outputs[0].shape.slice(1);//this.xs.shape.slice(1);//[7, 7, 1024];
        
          if (! this.model)
          {
            // Creates a 2-layer fully connected model. By creating a separate model,
            // rather than adding layers to the mobilenet model, we "freeze" the weights
            // of the mobilenet model, and only train weights from the new model.
            this.model = tf.sequential({
              layers: [
                // Flattens the input to a vector so we can use it in a dense layer. While
                // technically a layer, this only performs a reshape (and has no training
                // parameters).
                tf.layers.flatten({inputShape: inputShape}),
                // Layer 1
                tf.layers.dense({
                  units: 100,//how many hidden neurons, this is the default, and what we should use
                  activation: 'relu',
                  kernelInitializer: 'varianceScaling',
                  useBias: true //bias is like the b in y=mx + b and for these internal layers it should be used
                        //note this is NOT the bias like bias vs variance trade off
                }),
                // Layer 2. The number of units of the last layer should correspond
                // to the number of classes we want to predict.
                tf.layers.dense({
                  units: numClasses,
                  kernelInitializer: 'varianceScaling',
                  useBias: false,
                  activation: 'softmax'
                })
              ]
            });

            // Creates the optimizers which drives training of the model.
            const learningRate = 0.00001;//this is just the stardard good default
            const optimizer = tf.train.adam(learningRate);
            // We use categoricalCrossentropy which is the loss function we use for
            // categorical classification which measures the error between our predicted
            // probability distribution over classes (probability that an input is of each
            // class), versus the label (100% probability in the true class)>
            this.model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy'});
          }

          // We parameterize batch size as a fraction of the entire dataset because the
          // number of examples that are collected depends on how many examples the user
          // collects. This allows us to have a flexible batch size.
          const batchSize = 1;//Math.floor(this.xs.shape[0] * 0.4);
          if (!(batchSize > 0)) {
            throw new Error(
            `Batch size is 0 or NaN. Please choose a non-zero fraction.`);
          }

          // Train the model! Model.fit() will shuffle xs & ys so we don't have to.
          await this.model.fit(this.xs, this.ys, {
            batchSize,
            epochs: 100,//20 was a good default from tensorflow project
            callbacks: {
              onBatchEnd: async (batch, logs) => {
                console.log('Loss: ' + logs.loss.toFixed(5));
              }
            }
          });
    };

    this.fromCanvas = function (canvas){
      const img = tf.browser.fromPixels(canvas);
      //note: per https://github.com/tensorflow/tfjs-examples/blob/master/webcam-transfer-learning/index.html#L122
      //we just have to assume the canvas input is the same size currently. I suspect there's a different strategy
      //for resizing to match down, but would it be worth it, perf-wize?
      const processedImg =
      tf.tidy(() => img.expandDims(0).toFloat().div(127).sub(1));
  img.dispose();
      return processedImg;
    };

    this.predictClass = async function predictClass(img){
      const input = this.fromCanvas(img);
      const embeddings= this.truncatedMobileNet.predict(input);
      const result= this.predictClassInternal(embeddings);
      embeddings.dispose();
      return result;      
    };
    this.predictClassInternal = async function predictClassInternal(activation) {
         // Make a prediction through our newly-trained model using the activation
      // from mobilenet as input.
      const predictions = this.model.predict(activation);

      // Returns the index with the maximum probability. This number corresponds
      // to the class the model thinks is the most probable given the input.
      var flatpredictions = await predictions.as1D();
      var predictedClass = flatpredictions.argMax();
      const classId = (await predictedClass.data())[0];
      var confidences = await flatpredictions.data();
      predictedClass.dispose();
      flatpredictions.dispose();
      return {
        classIndex: classId,
        confidences: confidences
      };
    };
      
};

