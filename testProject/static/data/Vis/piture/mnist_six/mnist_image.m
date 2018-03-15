clear all;
data=csvread('mnist.csv');
for i=2426:2803
    imagedata=data(i,:);
    %imagedata1=imagedata;
    %for j=1:784
        %for k=784:1
        %imagedata1(j)=imagedata(k);
        %end
    %end
    imagedata=reshape(imagedata,28,28);
    imagedata1=imagedata;
    for j=1:28
        for k=1:28
            imagedata1(j,k)=imagedata(j,29-k);
        end
    end
    imagedata2=imrotate(imagedata1,90);
    imagename=strcat('mnist',int2str(i-2425),'.bmp');
    imwrite(imagedata2,imagename);
end

