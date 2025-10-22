CREATE OR REPLACE FUNCTION {schema}.random_string(
    IN length integer DEFAULT 1,
    OUT result text
) 
RETURNS text
LANGUAGE 'plpgsql' 
VOLATILE
AS 

$BODY$

DECLARE 
    i integer := 0;
    chars text [] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z}';
BEGIN 
    IF length < 0 THEN 
        RAISE EXCEPTION 'Length cannot be negative';
    END IF;
    result := '';
    FOR i IN 1..length 
    LOOP 
        result := result || chars [1 + floor(random() * array_length(chars, 1))];
    END LOOP;
    RETURN;
END;

$BODY$
