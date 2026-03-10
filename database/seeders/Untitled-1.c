//Point drawing  on openGL
#include<GL/glut.h>//openGL header files
#include<Stdlib.h>//standard library header files
void myInit(void)
{     glClearColor(1,1,1,1);
    
     glPointSize(20.0); //specify the size of the point in pixel
     glMatrixMode(GL_PROJECTION);//start drowing the graphics
     glLoadIdentity();
     gluOrtho2D(-20.0,20.0,-20.0,20.0);// first and last parameters used to control right and top position respectively respect to windows
	                                   // second and third parameters used to control left and bottom position respectively respect ot windows
          }
          void Display(void)
          {  
              glClear(GL_COLOR_BUFFER_BIT);
              glBegin(GL_LINES);
              glColor3f(1.0,0.0,0.0);//specify the color of the points
              glVertex2i(-10,10);
              glColor3f(0.0,1.0,0.0);//specify the color of the points
              glVertex2i(-10,-10);
              glColor3f(0.0,0.0,1.0);//specify the color of the points
              glVertex2i(10,-10);
              glVertex2i(10,10);
              glEnd();
              glFlush();
          }
               int main(int argc, char** argv)
               {   
			   		glutInit(&argc, argv);
                   glutInitWindowSize(700,580);
                   glutInitWindowPosition(10,20);
                   glutCreateWindow("Point In lab with transformation");
                   glutDisplayFunc(Display);
                   myInit();//calls the function void myInit
                   glutMainLoop();//put the  OpenGL graphics system to wait for events (such as re-paint), and  trigger respective event handlers (such as display()). 

                   return 0;                   
                   }
